import { useState, useEffect, useRef } from "react";
import { Alert, Share } from "react-native";
import { captureRef } from "react-native-view-shot";
import { updateUserTier, evaluateTier } from "@/services/tier/tierService";
import {
  TIER_THEMES,
  TIER_NAME_MAP,
  TierName,
  ServerTierName,
} from "./TierResult.constants";

export const useTierResult = (navigation: any, route: any, viewRef: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tierName, setTierName] = useState<TierName | null>(null);
  const [tierData, setTierData] = useState<any>(null);
  const hasSaved = useRef(false);

  // route.params에서 데이터 추출
  const { recordId, distanceType, achievedTier } = route.params ?? {};

  useEffect(() => {
    const initializeData = async () => {
      const targetRecordId = recordId || 192;
      // 5k, 10k 규격화
      const distType = distanceType?.toLowerCase().includes("10")
        ? "10k"
        : "5k";

      try {
        setLoading(true);
        setError(false);

        // 🔍 [Step 1] 티어 데이터 조회 (화면 표시용)
        const response = await evaluateTier({
          recordId: targetRecordId,
          distanceType: distType,
        });

        if (response && response.name) {
          const serverName = response.name as ServerTierName;
          const mappedTierName = TIER_NAME_MAP[serverName];

          if (mappedTierName && TIER_THEMES[mappedTierName]) {
            setTierData(response);
            setTierName(mappedTierName);
          } else {
            setTierName("rubber"); // Fallback
          }

          // 🚀 [Step 2] 조회가 잘 되면 유저 티어 테이블에 최종 저장
          if (!hasSaved.current) {
            hasSaved.current = true;
            await saveUserTierProcess(distType, achievedTier);
          }
        } else {
          throw new Error("Invalid Response");
        }
      } catch (e) {
        console.error("❌ 티어 로드 실패:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [recordId]);

  /**
   * ✅ 거리별 티어 ID 매핑 로직
   * 5k (Offset 0): 1(크리스탈)~6(맨발)
   * 10k (Offset 6): 7(크리스탈)~12(맨발)
   */
  const saveUserTierProcess = async (distType: string, tierText: string) => {
    try {
      const is10k = distType.includes("10");
      const formattedDist = is10k ? "KM_10" : "KM_5";
      const offset = is10k ? 6 : 0; // 10k면 ID가 7부터 시작하도록 6을 더함

      let relativeId = 6; // 기본값(맨발)

      if (tierText.includes("크리스탈")) relativeId = 1;
      else if (tierText.includes("구두")) relativeId = 2;
      else if (tierText.includes("고무신")) relativeId = 3;
      else if (tierText.includes("슬리퍼")) relativeId = 4;
      else if (tierText.includes("짚신")) relativeId = 5;
      else if (tierText.includes("맨발")) relativeId = 6;

      const finalTierId = relativeId + offset;

      console.log("====================================================");
      console.log(`🚀 [SAVE] 서버 저장 데이터 확인`);
      console.log(`📍 거리타입: ${formattedDist}`);
      console.log(`📍 티어명: ${tierText}`);
      console.log(
        `📍 최종 티어 ID: ${finalTierId} (${is10k ? "10k 모드" : "5k 모드"})`
      );
      console.log("====================================================");

      await updateUserTier(finalTierId, formattedDist);
      console.log("✅ 유저 티어 저장 성공");
    } catch (err) {
      console.error("❌ 유저 티어 저장 실패:", err);
    }
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(viewRef, { format: "png", quality: 0.8 });
      await Share.share({
        url: uri,
        message: "나의 러닝 티어를 확인해보세요!",
      });
    } catch (e) {
      Alert.alert("공유 실패", "이미지를 생성할 수 없습니다.");
    }
  };

  return { tierName, tierData, loading, error, handleShare };
};
