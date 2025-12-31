// src/hooks/useMe.ts
import { useEffect, useState } from "react";
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

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_BASE_URL}/api/users/me`, { headers });

                if (!res.ok) {
                    throw new Error(`useMe failed: ${res.status}`);
                }

                const data = (await res.json()) as UserMeResponseDto;
                if (mounted) setMe(data);
            } catch (e) {
                if (mounted) setError(e as Error);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return { me, loading, error };
}
