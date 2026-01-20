// contexts/UserSettingContext.tsx

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
} from 'react';
import { UserSetting } from '@/types/userSetting';
import { NotificationType } from '@/types/notification';
import { userSettingService } from '@/services/setting/userSettingService';

/**
 * =========================
 * 기본 알림 설정값
 * - row가 없는 타입은 이 값 사용
 * =========================
 */
const DEFAULT_NOTIFICATION_PREFERENCES: Record<NotificationType, boolean> = {
    RUN_RESULT: true,
    CHALLENGE: true,
    REMINDER: false,
    EVENT: false,
};

/**
 * 서버 응답(notificationPreferences 배열)을
 * UI에서 쓰는 map 형태로 변환
 */
function normalizeNotificationPreferences(
    list?: { type: NotificationType; enabled: boolean }[]
): Record<NotificationType, boolean> {
    const result = { ...DEFAULT_NOTIFICATION_PREFERENCES };

    if (!list) return result;

    list.forEach(p => {
        result[p.type] = p.enabled;
    });

    return result;
}

type UserSettingContextValue = {
    settings: UserSetting | null;
    setSettings: React.Dispatch<React.SetStateAction<UserSetting | null>>;
    reload: () => Promise<void>;
    reset: () => void;
    isReady: boolean;
};

const UserSettingContext = createContext<UserSettingContextValue | null>(null);

export function UserSettingProvider({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const [settings, setSettings] = useState<UserSetting | null>(null);
    const [isReady, setIsReady] = useState(false);

    /**
     * =========================
     * 설정 로드 (앱 시작 / 로그인 후)
     * =========================
     */
    const load = async () => {
        const response = await userSettingService.getMySettings();

        const normalized: UserSetting = {
            ...response,

            // 여기서 notificationPreferences "생성"
            notificationPreferences: normalizeNotificationPreferences(
                // 서버 응답에 없을 수도 있으므로 방어
                (response as any).notificationPreferences
            ),
        };

        setSettings(normalized);
    };

    useEffect(() => {
        const init = async () => {
            try {
                await load();
            } finally {
                setIsReady(true);
            }
        };

        init();
    }, []);

    /**
     * 외부에서 다시 불러오고 싶을 때
     * (ex. 로그아웃 후 재로그인)
     */
    const reload = async () => {
        await load();
    };

    /**
     * 로그아웃 시 초기화
     */
    const reset = () => {
        setSettings(null);
        setIsReady(false);
    };

    if (!isReady) {
        return null; // 또는 <FullScreenSplash />
    }
    return (
        <UserSettingContext.Provider
            value={{
                settings,
                setSettings,
                reload,
                reset,
                isReady,
            }}
        >
            {children}
        </UserSettingContext.Provider>
    );
}

export function useUserSettingContext() {
    const ctx = useContext(UserSettingContext);
    if (!ctx) {
        throw new Error('UserSettingContext not found');
    }
    return ctx;
}
