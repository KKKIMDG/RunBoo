// types/userSetting.ts
import { Notification } from '@/types/notification';

export type UserSetting = {
    pushEnabled: boolean;
    voiceEnabled: boolean;
    voiceType: 'MALE' | 'FEMALE';
    themeMode: 'LIGHT' | 'DARK' | 'SYSTEM';
    fontSize: 'SMALL' | 'NORMAL' | 'LARGE';

    notificationPreferences: {
        [key in Notification]: boolean;
    };
};

