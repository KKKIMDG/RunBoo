import { api } from "@/services/api";
import type { UserBadgeDto } from "@/types/badge";

/**
 * 로그인한 유저가 획득한 뱃지 목록 조회
 * @returns 유저-뱃지 매핑 리스트
 */
export async function fetchUserBadges(): Promise<UserBadgeDto[]> {
    const res = await api.get("/api/user-badges/");

    return (res ?? []) as UserBadgeDto[];
}