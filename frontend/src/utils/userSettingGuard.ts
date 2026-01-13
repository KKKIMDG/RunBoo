import { UserSetting } from "@/types/userSetting";

const DEFAULT_USER_SETTING: UserSetting = {
  pushEnabled: true,
  voiceGuideEnabled: true,
  voiceType: "MALE",
  themeMode: "SYSTEM",
  fontSize: "SMALL",
};

export function normalizeUserSetting(
  raw: Partial<UserSetting> | null | undefined
): UserSetting {
  if (!raw) {
    return DEFAULT_USER_SETTING;
  }

  return {
    pushEnabled:
      typeof raw.pushEnabled === "boolean"
        ? raw.pushEnabled
        : DEFAULT_USER_SETTING.pushEnabled,

    voiceGuideEnabled:
      typeof raw.voiceGuideEnabled === "boolean"
        ? raw.voiceGuideEnabled
        : DEFAULT_USER_SETTING.voiceGuideEnabled,

    voiceType:
      raw.voiceType === "MALE" || raw.voiceType === "FEMALE"
        ? raw.voiceType
        : DEFAULT_USER_SETTING.voiceType,

    themeMode:
      raw.themeMode === "LIGHT" ||
      raw.themeMode === "DARK" ||
      raw.themeMode === "SYSTEM"
        ? raw.themeMode
        : DEFAULT_USER_SETTING.themeMode,

    fontSize:
      raw.fontSize === "SMALL" ||
      raw.fontSize === "MEDIUM" ||
      raw.fontSize === "LARGE"
        ? raw.fontSize
        : DEFAULT_USER_SETTING.fontSize,
  };
}
