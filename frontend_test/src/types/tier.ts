// src/types/tier.ts

/**
 * 티어 평가 API 요청 본문 타입
 */
export interface TierEvaluationRequest {
  distanceType: '5k' | '10k'; // 거리 유형
  recordId: number; // 기록 ID
}

/**
 * 티어 평가 API 응답 데이터 타입
 */
export interface TierData {
  tierId: number; // 티어 ID
  name: string; // 티어 영문명 (e.g., "SHOES")
  displayName: string; // 티어 한글명 (e.g., "구두")
  distanceType: '5k' | '10k'; // 거리 유형
  minPaceSecPerKm: number; // 최소 페이스 (km당 초)
  maxPaceSecPerKm: number; // 최대 페이스 (km당 초)
}
