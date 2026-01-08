import { api } from "@/services/api";
import type { UserMe } from "@/types/userMe";
import { UserVoiceSetting } from "@/types/userSetting";

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

/**
 * 현재 비밀번호 검증
 * POST /api/users/me/password/verify
 */
export const verifyCurrentPassword = async (
  currentPassword: string
): Promise<void> => {
  await api.post("/api/users/me/password/verify", {
    currentPassword,
  });
};

/**
 * 비밀번호 변경
 * PUT /api/users/me/password
 */
export const changePassword = async (newPassword: string): Promise<void> => {
  await api.put("/api/users/me/password", {
    newPassword,
  });
};

export const updateBlindStatus = async (blind: boolean): Promise<void> => {
  await api.patch("/api/users/me/blind", { blind });
};

/** ✅ 유저의 기본 음성 설정 조회 (러닝 시작 전 호출용) */
export async function fetchUserVoiceSetting(): Promise<UserVoiceSetting> {
  // 서버에서 유저 테이블에 저장된 voice_enabled, voice_type 값을 가져옵니다.
  const res = await api.get(`/api/users/voice-settings`);
  return res as UserVoiceSetting;
}
