import { api } from "@/services/api";
import type { GhostProfileDto } from "@/types/ghost";

/** 고스트 프로필 목록 */
export async function fetchGhostProfiles(): Promise<GhostProfileDto[]> {
    // records랑 동일한 방식: api.get()이 "데이터"를 바로 준다고 가정
    const res = await api.get(`/api/ghost-profiles`);
    return (res ?? []) as GhostProfileDto[];
}

/** 고스트 프로필 단건 */
export async function fetchGhostProfile(
    ghostProfileId: number
): Promise<GhostProfileDto> {
    const res = await api.get(`/api/ghost-profiles/${ghostProfileId}`);
    return res as GhostProfileDto;
}

export async function fetchTargetUserBestGhost(targetUserId: number): Promise<GhostProfileDto | null> {
    try {
        const res = await api.get(`/api/ghost-profiles/users/${targetUserId}/best`);

        if (!res) return null;

        return {
            ...(res as any),
            type: "TARGET_USER_BEST"
        } as GhostProfileDto;
    } catch (error) {
        console.error("상대방 고스트 조회 실패", error);
        return null;
    }
}

// ✅ 친구별 best Tier 고스트 목록
export type FriendTierGhostDto = {
    friendUserId: number;
    friendNickname: string;
    friendProfileImageUrl: string | null;

    runRecordId: number;
    avgPace: number;
    mode: string; // "Tier"

    ghostProfileId: number;
    type: string; // 서버의 GhostProfile.type
    targetDistanceKm: number;
    createdAt: string;
};

export async function fetchFriendTierBestGhosts(): Promise<FriendTierGhostDto[]> {
    const res = await api.get(`/api/ghost-profiles/friends/tier-best`);
    return (res ?? []) as FriendTierGhostDto[];
}
