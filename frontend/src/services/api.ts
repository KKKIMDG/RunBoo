// services/api.ts
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = API_BASE_URL;

let accessToken: string | null = null;

/**
 * 인증 토큰 설정 (로그인 / 로그아웃 시 호출)
 */
export const setAccessToken = (token: string | null) => {
    accessToken = token && token.trim() !== '' ? token : null;
};

/**
 * Authorization 헤더 생성
 */
const getAuthHeader = (): Record<string, string> => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
};

/**
 * 공통 응답 처리
 */
const handleResponse = async (res: Response) => {
    if (!res.ok) {
        let message = '요청에 실패했습니다.';

        try {
            const text = await res.text();
            if (text) {
                const body = JSON.parse(text);
                if (body?.message) message = body.message;
            }
        } catch (_) {}

        throw { status: res.status, message };
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
};

/**
 * 🔑 accessToken 재발급 (refreshToken 사용)
 * ⚠️ api/request 절대 사용 금지
 *  동시 401 요청 잠금
 */
let refreshingPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
    if (refreshingPromise) return refreshingPromise;

    refreshingPromise = (async () => {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        const res = await fetch(`${BASE_URL}/api/auth/token/reissue`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${refreshToken}` },
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.accessToken ?? null;
    })();

    const token = await refreshingPromise;
    refreshingPromise = null;
    return token;
};


/**
 * 공통 request
 */
const request = async (
    input: RequestInfo,
    init: RequestInit,
    retry = true
) => {
    const res = await fetch(input, init);

    // ✅ 401만 특별 취급
    if (res.status !== 401) {
        return handleResponse(res);
    }

    // 재시도 불가
    if (!retry) {
        throw { status: 401, message: '인증이 만료되었습니다.' };
    }

    // 🔄 토큰 재발급
    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
        throw { status: 401, message: '로그인이 필요합니다.' };
    }

    await AsyncStorage.setItem('accessToken', newAccessToken);
    setAccessToken(newAccessToken);

    // 원래 요청 1회 재시도
    return request(
        input,
        {
            ...init,
            headers: {
                ...(init.headers || {}),
                Authorization: `Bearer ${newAccessToken}`,
            },
        },
        false
    );
};

export const api = {
    get: async (path: string) => {
        return request(`${BASE_URL}${path}`, {
            method: 'GET',
            headers: {
                ...getAuthHeader(),
            },
        });
    },

    post: async <T>(path: string, data: T) => {
        return request(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });
    },

    put: async <T>(path: string, data: T) => {
        return request(`${BASE_URL}${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader(),
            },
            body: JSON.stringify(data),
        });
    },

    delete: async (path: string) => {
        return request(`${BASE_URL}${path}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader(),
            },
        });
    },
};
