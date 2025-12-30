import { useState, useEffect, useCallback } from "react";
import { Share, Alert, View } from "react-native";
import { evaluateTier } from "@/services/tierService";
import { fetchRecordDetail } from "@/services/record/recordsService"; // ✅ 파일명 확인 (recordService)
import { TierData } from "@/types/tier";
import { RecordDetailDto } from "@/types/record"; // ✅ RecordDetailDto 타입 임포트 추가
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
  // ✅ recordData의 타입을 RecordDetailDto | null로 정확히 지정합니다.
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [recordData, setRecordData] = useState<RecordDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // route.params에서 recordId를 가져오되 없으면 테스트용 1 사용
  const recordId = route?.params?.recordId || 1;
  const distanceType = route?.params?.distanceType || "5k";

  // 데이터 기반으로 티어 영문 키값 결정
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

      // ✅ 티어 평가와 기록 상세 정보를 병렬로 호출
      const [tierResponse, recordResponse] = await Promise.all([
        evaluateTier({ distanceType, recordId }),
        fetchRecordDetail(recordId),
      ]);

      console.log("받아온 티어 데이터:", tierResponse);
      console.log("받아온 레코드 상세:", recordResponse);

      setTierData(tierResponse);
      setRecordData(recordResponse); // ✅ 상태 저장
    } catch (err: any) {
      console.error("API 에러:", err);
      setError("정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [recordId, distanceType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShare = async () => {
    try {
      if (!viewRef.current) return;

      // 1. 현재 화면(viewRef 영역)을 이미지 URI로 변환
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 0.9,
      });

      // 2. 기기에서 공유 기능이 사용 가능한지 확인
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // 3. 공유창 띄우기 (이미지 복사, 카톡 공유, 인스타 등 자동 포함)
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "나의 러닝 기록 자랑하기",
          UTI: "public.png",
        });
      } else {
        alert("공유 기능을 사용할 수 없는 기기입니다.");
      }
    } catch (error) {
      console.error("공유 중 오류 발생:", error);
      alert("이미지 생성 중 오류가 발생했습니다.");
    }
  };

  return {
    tierName,
    tierData,
    recordData,
    loading,
    error,
    handleShare,
  };
};
