import { api } from "@/services/api";
import type { RecordDto, DashboardStatsDto } from "@/types/record";

/** 내 기록 목록 조회 */
export async function fetchMyRecords(userId: number): Promise<RecordDto[]> {
    const { data } = await api.get<RecordDto[]>(`/records/user/${userId}`);
    return data;
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(userId: number): Promise<DashboardStatsDto> {
    const { data } = await api.get<DashboardStatsDto>(`/records/user/${userId}/dashboard`);
    return data;
}
