// frontend/src/services/record/recordsService.ts

import { api } from "@/services/api";
import type {
    RecordDto,
    DashboardStatsDto,
    GrassResponseDto,
    CreateRecordRequest,
} from "@/types/record";

/** 내 기록 목록 조회 */
export async function fetchMyRecords(): Promise<RecordDto[]> {
    // 백엔드: GET /api/records
    const res = await api.get(`/api/records`);
    return (res ?? []) as RecordDto[];
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(): Promise<DashboardStatsDto> {
    // 백엔드: GET /api/records/stats/dashboard
    const res = await api.get(`/api/records/stats/dashboard`);
    return res as DashboardStatsDto;
}

/** 활동 잔디 관련 **/
export async function fetchGrass(weeks = 12): Promise<GrassResponseDto> {
    // api.get은 path만 받으니까 쿼리스트링을 직접 붙여야 함
    const res = await api.get(`/api/records/grass?weeks=${weeks}`);
    return res as GrassResponseDto;
}

/** 프로필페이지 연속 일수 관련 */
export async function fetchCurrentRunningStreak(): Promise<number> {
    const res = await api.get("/api/records/streak/current");
    return res as number;
}

/** 전국 랭킹 TOP5 (TIER만, avg_pace 빠른 순) */
export async function fetchNationalRankingTop5(): Promise<RecordDto[]> {
    // 백엔드: GET /api/records/ranking/national
    const res = await api.get(`/api/records/ranking/national`);
    return (res ?? []) as RecordDto[];
}

/** 프로필 페이지에서 누적 총 거리 */
export async function fetchTotalRunDistanceM(): Promise<number> {
    // 백엔드 : GET /api/records/profile/totalRunDistance
    const res = await api.get(`/api/records/profile/totalRunDistance`);
    return res as number;
}

export const createRecord = async (requestData: CreateRecordRequest) => {
    return api.post("/api/records", requestData);
};

export async function fetchMonthlyAnalysis(): Promise<string> {
    const res = await api.get("/api/records/analysis/monthly");
    if (res && typeof res === 'object' && 'message' in res) {
        return (res as any).message;
    }
    return res as string;
}
