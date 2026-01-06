// hooks/useSettings.ts
import { useRef } from 'react';
import { useUserSettingContext } from '@/contexts/UserSettingContext';
import { UserSetting } from '@/types/userSetting';
import { userSettingService } from '@/services/setting/userSettingService';

const DEBOUNCE_MS = 400;

export function useSettings() {
    const { settings, setSettings } = useUserSettingContext();

    const prevRef = useRef<UserSetting | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (!settings) {
        return {
            settings: null,
            update: () => {},
            loading: true,
        };
    }

    const update = <K extends keyof UserSetting>(
        key: K,
        value: UserSetting[K]
    ) => {
        prevRef.current = settings;

        setSettings(prev =>
            prev ? { ...prev, [key]: value } : prev
        );

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            try {
                await userSettingService.updateMySettings({
                    [key]: value,
                });
            } catch {
                if (prevRef.current) setSettings(prevRef.current);
            }
        }, DEBOUNCE_MS);
    };

    return {
        settings,
        update,
    };
}
