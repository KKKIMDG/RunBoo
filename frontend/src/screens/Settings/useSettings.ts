// hooks/useSettings.ts

import { useRef } from 'react';
import { useUserSettingContext } from '@/contexts/UserSettingContext';
import { UserSetting } from '@/types/userSetting';
import {NotificationType} from '@/types/notification';
import { userSettingService } from '@/services/setting/userSettingService';

const DEBOUNCE_MS = 400;

export function useSettings() {
    const { settings, setSettings } = useUserSettingContext();

    // 이전 상태 (롤백용)
    const prevRef = useRef<UserSetting | null>(null);

    // debounce 타이머
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (!settings) {
        return {
            settings: null,
            update: () => {},
            updateNotificationPreference: () => {},
            loading: true,
        };
    }

    /**
     * 설정 변경 (기존 단일 설정용)
     */
    const update = <K extends keyof UserSetting>(
        key: K,
        value: UserSetting[K]
    ) => {
        prevRef.current = settings;

        setSettings(prev =>
            prev ? { ...prev, [key]: value } : prev
        );

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            try {
                await userSettingService.updateMySettings({
                    [key]: value,
                });
            } catch (e) {
                if (prevRef.current) {
                    setSettings(prevRef.current);
                }
            }
        }, DEBOUNCE_MS);
    };

    /**
     * ✅ 알림 설정 변경 (type 기반)
     */
    const updateNotificationPreference = (
        type: NotificationType,
        enabled: boolean
    ) => {
        prevRef.current = settings;

        // 1️⃣ UI 즉시 반영
        setSettings(prev =>
            prev
                ? {
                    ...prev,
                    notificationPreferences: {
                        ...prev.notificationPreferences,
                        [type]: enabled,
                    },
                }
                : prev
        );

        // 2️⃣ debounce
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            try {
                await userSettingService.updateNotificationPreference({
                    type,
                    enabled,
                });
            } catch (e) {
                // 3️⃣ 실패 시 롤백
                if (prevRef.current) {
                    setSettings(prevRef.current);
                }
            }
        }, DEBOUNCE_MS);
    };

    return {
        settings,
        update,
        updateNotificationPreference,
    };
}
