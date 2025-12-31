import { api } from "@/services/api";
import type {
  RecordDto,
  DashboardStatsDto
} from "@/types/record";

/** 내 기록 목록 조회 */
export async function fetchMyRecords(): Promise<RecordDto[]> {
  // 백엔드: GET /api/records
  const res = await api.get(`/api/records`);
  return (res ?? []) as RecordDto[];
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(
): Promise<DashboardStatsDto> {
  // 백엔드: GET /api/records/stats/dashboard
  const res = await api.get(`/api/records/stats/dashboard`);
  return res as DashboardStatsDto;
}
