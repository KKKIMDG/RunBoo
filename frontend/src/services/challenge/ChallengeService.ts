import { api } from "@/services/api";
import type { UserChallengeDto } from "@/types/challenge";

/**
 * 챌린지 초기화 (시즌 첫 참여 시 30개 생성)
 * @param seasonId - 시즌 ID
 */
export async function initializeChallenges(seasonId: number): Promise<string> {
  const response = await api.post("/api/challenges/initialize", {
    seasonId,
  });
  return response;
}

/**
 * 현재 활성화된 챌린지 조회 (진행 중 1개 + 다음 2개)
 */
export async function getActiveChallenges(): Promise<UserChallengeDto[]> {
  const response = await api.get("/api/challenges/active");
  return response ?? [];
}

/**
 * 완료된 챌린지 조회
 */
export async function getCompletedChallenges(): Promise<UserChallengeDto[]> {
  const response = await api.get("/api/challenges/completed");
  return response ?? [];
}

/**
 * 진행도 업데이트 (러닝 데이터 전송)
 * @param type - 타입 (DISTANCE, COUNT 등)
 * @param value - 값
 */
export async function updateProgress(
  type: string,
  value: number,
): Promise<UserChallengeDto[]> {
  const response = await api.patch("/api/challenges/progress", {
    type,
    value,
  });
  return response ?? [];
}
