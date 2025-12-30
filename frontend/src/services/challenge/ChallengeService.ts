import { api } from "@/services/api";
import type { UserChallengeDto } from "@/types/challenge";

/** * 상태별 챌린지 목록 조회 (IN_PROGRESS, COMPLETED)
 */
export async function fetchUserChallengesByStatus(
  status: "IN_PROGRESS" | "COMPLETED"
): Promise<UserChallengeDto[]> {
  // ✅ 백엔드 주소와 파라미터를 하나의 문자열로 합쳐서 전달
  const res = await api.get(`/api/user-challenges/status/${status}`);
  return (res ?? []) as UserChallengeDto[];
}
