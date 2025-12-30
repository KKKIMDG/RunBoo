import { api } from "@/services/api";
import type {
  RecordDto,
  DashboardStatsDto,
  RecordDetailDto,
} from "@/types/record";

/** 내 기록 목록 조회 */
export async function fetchMyRecords(userId: number): Promise<RecordDto[]> {
  // 백엔드: GET /api/records?userId=...
  const res = await api.get(`/api/records?userId=${userId}`);
  return (res ?? []) as RecordDto[];
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(
  userId: number
): Promise<DashboardStatsDto> {
  // 백엔드: GET /api/records/stats/dashboard?userId=...
  const res = await api.get(`/api/records/stats/dashboard?userId=${userId}`);
  return res as DashboardStatsDto;
}
/** * 기록 상세 정보 조회 (티어 결과 화면용)*/
export async function fetchRecordDetail(
  recordId: number
): Promise<RecordDetailDto> {
  // 백엔드 RunRecordController의 @GetMapping("/{recordId}")와 연결됩니다.
  // 경로: GET /api/records/1
  const res = await api.get(`/api/run-records/${recordId}`);
  return res as RecordDetailDto;
}
