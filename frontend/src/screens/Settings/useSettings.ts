// hooks/useSettings.ts

import { useRef } from 'react';
import { useUserSettingContext } from '@/contexts/UserSettingContext';
import { UserSetting } from '@/types/userSetting';
import { userSettingService } from '@/services/setting/userSettingService';

const DEBOUNCE_MS = 400;

export function useSettings() {
    const { settings, setSettings } = useUserSettingContext();

    // 이전 상태 (롤백용)
    const prevRef = useRef<UserSetting | null>(null);

    // debounce 타이머
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    if (!settings) {
        return {
            settings: null,
            update: () => {},
            loading: true,
        };
    }

    /**
     * 설정 변경 (유일한 진입점)
     */
    const update = <K extends keyof UserSetting>(
        key: K,
        value: UserSetting[K]
    ) => {
        // 1️⃣ 롤백 대비 이전 상태 저장
        prevRef.current = settings;

        // 2️⃣ UI 즉시 반영 (낙관적 업데이트)
        setSettings(prev =>
            prev ? { ...prev, [key]: value } : prev
        );

        // 3️⃣ debounce: 기존 요청 취소
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // 4️⃣ 일정 시간 후 서버 PATCH
        timerRef.current = setTimeout(async () => {
            try {
                await userSettingService.updateMySettings({
                    [key]: value,
                });
            } catch (e) {
                // 5️⃣ 실패 시 롤백
                if (prevRef.current) {
                    setSettings(prevRef.current);
                }
            }
        }, DEBOUNCE_MS);
    };

    return {
        settings,
        update,
    };
}
