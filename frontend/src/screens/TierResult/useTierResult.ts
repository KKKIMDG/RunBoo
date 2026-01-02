import { useState, useEffect, useCallback } from "react";
import { Alert, View } from "react-native";
import { evaluateTier } from "@/services/tier/tierService";
import { TierData } from "@/types/tier";
import {
  TIER_NAME_MAP,
  ServerTierName,
  TierName,
} from "./TierResult.constants";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export const useTierResult = (
  navigation: any,
  route: any,
  viewRef: React.RefObject<View | null>
) => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 티어 평가에 필요한 최소 파라미터만 유지
  const recordId = route?.params?.recordId;
  const distanceType = route?.params?.distanceType || "5k";

  // 서버 티어명 → 프론트 티어 키 매핑
  const tierName: TierName | null = tierData
    ? TIER_NAME_MAP[tierData.name as ServerTierName]
    : null;

  const fetchData = useCallback(async () => {
    if (!recordId) {
      setError("유효하지 않은 측정 기록입니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ 티어 평가만 수행
      const tierResponse = await evaluateTier({
        distanceType,
        recordId,
      });

      console.log("받아온 티어 데이터:", tierResponse);
      setTierData(tierResponse);
    } catch (err: any) {
      console.error("티어 평가 API 에러:", err);
      setError("티어 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [recordId, distanceType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 📸 공유 로직 (캡처 전용 책임)
  const handleShare = async () => {
    try {
      if (!viewRef.current) return;

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 0.9,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("알림", "공유 기능을 사용할 수 없는 기기입니다.");
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "나의 러닝 기록 자랑하기",
        UTI: "public.png",
      });
    } catch (error) {
      console.error("공유 중 오류 발생:", error);
      Alert.alert("오류", "이미지 생성 중 문제가 발생했습니다.");
    }
  };

  return {
    tierName,
    tierData,
    loading,
    error,
    handleShare,
  };
};
