export type GhostProfileType =
    | "SELF_BEST"
    | "SELF_YESTERDAY"
    | "SELF_WEEKLY_AVG"
    | "RANKING_NATIONAL_1"
    | "RANKING_NATIONAL_2"
    | "RANKING_NATIONAL_3"
    | "RANKING_NATIONAL_4"
    | "RANKING_NATIONAL_5";

export type GhostProfileDto = {
    id: number;
    userId: number;
    runRecordId: number;
    type: string; // SELF_BEST, SELF_YESTERDAY, SELF_WEEKLY_AVG, RANKING_NATIONAL, RANKING_LOCAL
    targetDistanceKm: number;
    avgPace: number; // 서버에서 Integer
    createdAt: string; // OffsetDateTime ISO 문자열
};