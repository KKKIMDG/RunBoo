import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMe } from "@/services/user/userService";
import { authEventBus } from "@/services/auth/authEvents";
import type { UserMe } from "@/types/userMe";

type UserMeContextValue = {
    userMe: UserMe | null;
    loading: boolean;
    refetch: () => Promise<void>;
};

const UserMeContext = createContext<UserMeContextValue | null>(null);

export function UserMeProvider({ children }: { children: React.ReactNode }) {
    const [userMe, setUserMe] = useState<UserMe | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * 로그아웃 처리
     * - 토큰 제거
     * - userMe 초기화
     */
    const logout = async () => {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        setUserMe(null);
    };

    /**
     * 내 정보 조회
     */
    const fetchUserMe = async () => {
        try {
            const me = await getMe();
            setUserMe(me);
        } catch (e: any) {
            // api.ts에서 refresh 실패 시 logout 이벤트가 emit됨
            // 그래도 안전하게 직접 401/403도 처리
            if (e?.status === 401 || e?.status === 403) {
                await logout();
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * 앱 시작 시 1회 내 정보 조회
     */
    useEffect(() => {
        fetchUserMe();
    }, []);

    /**
     * authEventBus 로그아웃 이벤트 구독
     * - refreshToken 만료
     * - 강제 로그아웃
     */
    useEffect(() => {
        const unsubscribe = authEventBus.subscribe(() => {
            logout();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <UserMeContext.Provider
            value={{
                userMe,
                loading,
                refetch: fetchUserMe,
            }}
        >
            {children}
        </UserMeContext.Provider>
    );
}

export function useUserMe() {
    const ctx = useContext(UserMeContext);
    if (!ctx) {
        throw new Error("useUserMe must be used within UserMeProvider");
    }
    return ctx;
}
