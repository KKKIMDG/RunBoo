// services/user/userSettingService.ts

import { api } from '@/services/api';
import { UserSetting } from '@/types/userSetting';
import { NotificationType } from '@/types/notification';

export const userSettingService = {

    /** 내 설정 조회 */
    getMySettings: async (): Promise<UserSetting> => {
        const res = await api.get('/api/settings');
        return res as UserSetting;
    },


    /** 내 설정 변경 */
    updateMySettings: async (
        payload: Partial<UserSetting>
    ): Promise<void> => {
        await api.patch('/api/settings', payload);
    },

    /** =====================
     *  알림 설정 변경 (단일 타입)
     *  ===================== */
    updateNotificationPreference: async (
        payload: {
            type: NotificationType;
            enabled: boolean;
        }
    ): Promise<void> => {
        await api.post('/api/notification/preferences', payload);
    },
};
