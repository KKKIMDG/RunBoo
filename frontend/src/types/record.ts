export type RecordDto = {
    id: number;
    distanceM: number;
    durationSec: number;
    avgPace: number;
    calories: number;
    startedAt: string;
    endedAt: string;
    mode: string; // "NORMAL" | "GHOST" | "TIER"
};

export type MonthlySummaryDto = {
    totalRuns: number;
    totalDistanceM: number;
    totalDurationSec: number;
    totalCalories: number;
};

export type WeeklyItemDto = {
    date: string; // LocalDate (YYYY-MM-DD)
    runs: number;
    distanceM: number;
    durationSec: number;
    calories: number;
};

export type WeeklySummaryDto = {
    items: WeeklyItemDto[];
};

export type PersonalBestsDto = {
    longestDistance: RecordDto | null;
    longestDuration: RecordDto | null;
    bestPace: RecordDto | null;
    mostCalories: RecordDto | null;
};

export type DashboardStatsDto = {
    monthly: MonthlySummaryDto;
    weekly: WeeklySummaryDto;
    personalBests: PersonalBestsDto;
};

export type GrassDayDto = {
    date: string; // "YYYY-MM-DD"
    distanceM: number;
    level: 0 | 1 | 2;
};

export type GrassResponseDto = {
    weeks: number;
    startDate: string;
    endDate: string;
    days: GrassDayDto[];
};

export interface CreateRecordRequest {
    userId?: number;
    mode: "NORMAL" | "TIER" | "GHOST";
    distanceM: number;
    durationSec: number;
    avgPace: number;
    calories: number;
    routePolyline: string;
    startedAt: string;
    endedAt: string;
}

/** ✅ 기록 상세(경로 포함) 응답 타입 */
export type RunRecordDetailDto = {
    recordId: number;
    mode: string;

    distanceM: number;
    durationSec: number;
    avgPace: number;
    calories: number;

    startedAt: string;
    endedAt: string;
    createdAt: string;

    timeText: string;
    paceText: string;

    routePolyline: string | null;
};
