import { api } from "@/services/api";
import type { RecordDto, DashboardStatsDto } from "@/types/record";

/** 내 기록 목록 조회 */
export async function fetchMyRecords(userId: number): Promise<RecordDto[]> {
    // ✅ 백엔드: GET /api/records?userId=...
    const res = await api.get(`/api/records?userId=${userId}`);
    return (res ?? []) as RecordDto[];
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(userId: number): Promise<DashboardStatsDto> {
    // ✅ 백엔드: GET /api/records/stats/dashboard?userId=...
    const res = await api.get(`/api/records/stats/dashboard?userId=${userId}`);
    return res as DashboardStatsDto;
}
