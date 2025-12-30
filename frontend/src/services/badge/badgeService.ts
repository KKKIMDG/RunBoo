import { api } from "@/services/api";
import type { BadgeDto } from "@/types/badge";

/**
 * 특정 유저가 획득한 뱃지 목록 조회
 * @param userId 유저 ID
 * @returns 뱃지 목록 리스트
 */
export async function fetchUserBadges(userId: number): Promise<BadgeDto[]> {
  // ✅ 백엔드 엔드포인트: GET /api/user-badges/{userId}
  const res = await api.get(`/api/user-badges/${userId}`);

  // 데이터가 없을 경우를 대비해 빈 배열 방어 처리
  return (res ?? []) as BadgeDto[];
}
