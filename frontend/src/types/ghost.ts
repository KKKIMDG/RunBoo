// frontend/src/types/ghost.ts

export type GhostProfileType =
    | "SELF_BEST"
    | "SELF_YESTERDAY"
    | "SELF_WEEKLY_AVG"
    | "TARGET_USER_BEST"
    | "FRIEND_TIER_BEST"
    | "RANKING_NATIONAL_1"
    | "RANKING_NATIONAL_2"
    | "RANKING_NATIONAL_3"
    | "RANKING_NATIONAL_4"
    | "RANKING_NATIONAL_5";

export type GhostProfileDto = {
    id: number;
    userId: number;
    runRecordId: number;
    type: string;
    targetDistanceKm: number;
    avgPace: number;
    createdAt: string;
};

// ✅ 친구(TIER best) 전용 DTO (run_records 기반)
export type FriendTierGhostDto = {
    friendUserId: number;
    friendNickname: string;
    friendProfileImageUrl: string | null;

    runRecordId: number;
    avgPace: number;
    mode: string;

    distanceM: number;
    startedAt: string | null;
    createdAt: string;
};
