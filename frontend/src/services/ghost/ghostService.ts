import { api } from "@/services/api";
import type { GhostProfileDto } from "@/types/ghost";

/** 고스트 프로필 목록 */
export async function fetchGhostProfiles(userId: number): Promise<GhostProfileDto[]> {
    // records랑 동일한 방식: api.get()이 "데이터"를 바로 준다고 가정
    const res = await api.get(`/api/ghost-profiles?userId=${userId}`);
    return (res ?? []) as GhostProfileDto[];
}

/** 고스트 프로필 단건 */
export async function fetchGhostProfile(
    userId: number,
    ghostProfileId: number
): Promise<GhostProfileDto> {
    const res = await api.get(`/api/ghost-profiles/${ghostProfileId}?userId=${userId}`);
    return res as GhostProfileDto;
}