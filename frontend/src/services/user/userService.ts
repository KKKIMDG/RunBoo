import { api } from "@/services/api";
import type { UserMe } from "@/types/userMe";

/**
 * 내 정보 조회
 * GET /api/users/me
 */
export const getMe = async (): Promise<UserMe> => {
    return api.get("/api/users/me");
};

/**
 * 닉네임 변경
 * PATCH /api/users/me/nickname
 */
export const updateMyNickname = async (nickname: string): Promise<void> => {
    await api.patch("/api/users/me/nickname", { nickname });
};

/**
 * 프로필 이미지 변경
 * PATCH /api/users/me/profile-image
 */
export const updateMyProfileImage = async (
    profileImageUrl: string
): Promise<void> => {
    await api.patch("/api/users/me/profile-image", { profileImageUrl });
};
