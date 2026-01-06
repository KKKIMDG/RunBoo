// hooks/useNotificationPreference.ts
import { useEffect, useRef, useState } from 'react';
import { NotificationType } from '@/types/notification';
import { notificationPreferenceService } from '@/services/notification/notificationPreferenceService';

const DEBOUNCE_MS = 400;

export type NotificationPreferences = Record<NotificationType, boolean>;

export function useNotificationPreference() {
    const [preferences, setPreferences] =
        useState<NotificationPreferences | null>(null);

    const prevRef = useRef<NotificationPreferences | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        const list = await notificationPreferenceService.getMyPreferences();

        // 서버 응답 → Record 형태로 변환
        const record = list.reduce((acc, cur) => {
            acc[cur.type] = cur.enabled;
            return acc;
        }, {} as NotificationPreferences);

        setPreferences(record);
    };

    const updatePreference = (
        type: NotificationType,
        enabled: boolean
    ) => {
        if (!preferences) return;

        prevRef.current = preferences;

        setPreferences(prev => ({
            ...prev!,
            [type]: enabled,
        }));

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            try {
                await notificationPreferenceService.updatePreference({
                    type,
                    enabled,
                });
            } catch {
                if (prevRef.current) {
                    setPreferences(prevRef.current);
                }
            }
        }, DEBOUNCE_MS);
    };

    return {
        preferences,
        updatePreference,
    };
}
