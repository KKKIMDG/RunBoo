export type UserSetting = {
    pushEnabled: boolean;
    voiceEnabled: boolean;
    voiceType: 'MALE' | 'FEMALE';
    themeMode: 'LIGHT' | 'DARK' | 'SYSTEM';
    fontSize: 'SMALL' | 'NORMAL' | 'LARGE';
};
