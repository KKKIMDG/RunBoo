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
        console.log("[useSettings] update called", {
            key,
            value,
            prev: settings[key],
        });

        prevRef.current = settings;

        setSettings(prev => {
            if (!prev) return prev;

            console.log("[useSettings] context updated", {
                key,
                prev: prev[key],
                next: value,
            });

            return { ...prev, [key]: value };
        });

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            try {
                console.log("[useSettings] API start", { key, value });

                await userSettingService.updateMySettings({
                    [key]: value,
                });

                console.log("[useSettings] API success", { key, value });
            } catch (e) {
                console.error("[useSettings] API failed → rollback", e);

                if (prevRef.current) {
                    setSettings(prevRef.current);
                    console.log("[useSettings] context rolled back", prevRef.current);
                }
            }
        }, DEBOUNCE_MS);
    };

    return {
        settings,
        update,
    };
}
