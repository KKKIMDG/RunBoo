// src/hooks/useMe.ts
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export type UserMeResponseDto = {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
};

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function useMe() {
    const [me, setMe] = useState<UserMeResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchMe = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const headers = await getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/users/me`, { headers });

            if (!res.ok) {
                throw new Error(`useMe failed: ${res.status}`);
            }

            const data = (await res.json()) as UserMeResponseDto;
            setMe(data);
        } catch (e) {
            setError(e as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 최초 1회 로딩
    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    return {
        me,
        loading,
        error,
        refetch: fetchMe, // ⭐️ 이게 이제 진짜로 동작함
    };
}
