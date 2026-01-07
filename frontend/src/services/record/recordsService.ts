// frontend/src/services/record/recordService.ts

import { api } from "@/services/api";
import type {
    RecordDto,
    DashboardStatsDto,
    GrassResponseDto,
    CreateRecordRequest,
    RunRecordDetailDto,
} from "@/types/record";

/** 내 기록 목록 조회 */
export async function fetchMyRecords(): Promise<RecordDto[]> {
    const res = await api.get(`/api/records`);
    return (res ?? []) as RecordDto[];
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(): Promise<DashboardStatsDto> {
    const res = await api.get(`/api/records/stats/dashboard`);
    return res as DashboardStatsDto;
}

/** 활동 잔디 관련 **/
export async function fetchGrass(weeks = 12): Promise<GrassResponseDto> {
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
    const res = await api.get(`/api/records/ranking/national`);
    return (res ?? []) as RecordDto[];
}

/** 프로필 페이지에서 누적 총 거리 */
export async function fetchTotalRunDistanceM(): Promise<number> {
    const res = await api.get(`/api/records/profile/totalRunDistance`);
    return res as number;
}

export const createRecord = async (requestData: CreateRecordRequest) => {
    return api.post("/api/records", requestData);
};

export async function fetchMonthlyAnalysis(): Promise<string> {
    const res = await api.get("/api/records/analysis/monthly");
    if (res && typeof res === "object" && "message" in res) {
        return (res as any).message;
    }
    return res as string;
}

/** ✅ 기록 상세(경로 포함) */
export async function fetchRunRecordDetail(recordId: number): Promise<RunRecordDetailDto> {
    const res = await api.get(`/api/run-records/${recordId}`);
    return res as RunRecordDetailDto;
}
