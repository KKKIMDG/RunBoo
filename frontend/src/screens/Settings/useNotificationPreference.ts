import { useEffect, useRef, useState } from 'react';
import { NotificationType } from '@/types/notification';
import { notificationPreferenceService } from '@/services/notification/notificationPreferenceService';

const DEBOUNCE_MS = 400;

export type NotificationPreferences = Record<NotificationType, boolean>;

export function useNotificationPreference() {
    const [preferences, setPreferences] =
        useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    // 롤백용
    const prevRef = useRef<NotificationPreferences | null>(null);

    // debounce 타이머
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 🔑 변경사항 누적
    const pendingRef = useRef<Partial<NotificationPreferences>>({});

    useEffect(() => {
        fetchPreferences();

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    /**
     * 알림 설정 조회
     */
    const fetchPreferences = async () => {
        try{
        const list = await notificationPreferenceService.getMyPreferences();

        const record = list.reduce((acc, cur) => {
            acc[cur.type] = cur.enabled;
            return acc;
        }, {} as NotificationPreferences);

        setPreferences(record);
        }finally{
            setLoading(false);
        }
    };

    /**
     * 알림 설정 변경 (debounce + 배치 저장)
     */
    const updatePreference = (
        type: NotificationType,
        enabled: boolean
    ) => {
        if (!preferences) return;

        // 롤백 스냅샷
        prevRef.current = preferences;

        // 1️⃣ UI 즉시 반영
        setPreferences(prev => ({
            ...prev!,
            [type]: enabled,
        }));

        // 2️⃣ 변경사항 누적
        pendingRef.current[type] = enabled;

        // 3️⃣ debounce 후 배치 저장
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(async () => {
            try {
                const payload = Object.entries(pendingRef.current).map(
                    ([t, v]) => ({
                        type: t as NotificationType,
                        enabled: v as boolean,
                    })
                );

                if (payload.length === 0) return;

                // ✅ 배치 API 단 한 번 호출
                await notificationPreferenceService.updatePreferencesBatch(
                    payload
                );

                // 성공 시 누적 초기화
                pendingRef.current = {};
            } catch {
                // 실패 시 롤백
                if (prevRef.current) {
                    setPreferences(prevRef.current);
                }
            }
        }, DEBOUNCE_MS);
    };

    return {
        preferences,
        loading,
        updatePreference,
        reload: fetchPreferences,
    };
}
