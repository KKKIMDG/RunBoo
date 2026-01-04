// services/user/userSettingService.ts

import { api } from '@/services/api';
import { UserSetting } from '@/types/userSetting';

export const userSettingService = {

    /** 내 설정 조회 */
    getMySettings: async (): Promise<UserSetting> => {
        const res = await api.get('/api/users/me/settings');
        return res as UserSetting;
    },


    /** 내 설정 변경 */
    updateMySettings: async (
        payload: Partial<UserSetting>
    ): Promise<void> => {
        await api.patch('/api/users/me/settings', payload);
    },
};
