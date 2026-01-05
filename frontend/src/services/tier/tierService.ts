// src/services/tier/tierService.ts
import { api } from "@/services/api";
import { TierEvaluationRequest, TierData } from "@/types/tier";

/**
 * 1. 티어 평가 요청 (POST)
 */
export const evaluateTier = (
  requestData: TierEvaluationRequest
): Promise<TierData> => {
  return api.post("/api/tier/evaluate", requestData);
};

/**
 * 2. 유저 티어 정보 저장/업데이트 (POST + QueryString)
 * @RequestParam 형식이므로 URL 뒤에 쿼리 스트링을 붙입니다.
 */
export const updateUserTier = async (tierId: number, distanceType: string) => {
  // 서버에서 @AuthenticationPrincipal로 유저를 식별하므로 Body는 빈 객체({})를 보냅니다.
  return api.post(
    `/api/user-tier/save?tierId=${tierId}&distanceType=${distanceType}`,
    {}
  );
};

/**
 * 3. 유저가 보유한 티어 ID 리스트 조회 (GET)
 * 최신 Swagger 명세(image_64476b.png)에 따라 숫자 배열(number[])을 반환합니다.
 */
export const getUserTierIds = (): Promise<number[]> => {
  return api.get("/api/user-tier/");
};
