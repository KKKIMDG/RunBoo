export type UserSetting = {
  pushEnabled: boolean;
  voiceGuideEnabled: boolean;
  voiceType: "MALE" | "FEMALE";
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
  fontSize: "SMALL" | "NORMAL" | "LARGE";
};

export type UserVoiceSetting = {
  voiceGuideEnabled: boolean;
  voiceType: "MALE" | "FEMALE";
};
