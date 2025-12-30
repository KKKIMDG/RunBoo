// services/api.ts
import {API_BASE_URL} from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = API_BASE_URL;

let accessToken: string | null = null;

/**
 * 인증 토큰 설정 (로그인 / 로그아웃 시 호출)
 */
export const setAccessToken = (token: string | null) => {
    // null, undefined, 빈 문자열 방어
    accessToken = token && token.trim() !== '' ? token : null;
};

/**
 * Authorization 헤더 생성
 * - 토큰이 있을 때만 붙인다
 */
const getAuthHeader = (): Record<string, string> => {
    if (!accessToken) return {};
    return {
        Authorization: `Bearer ${accessToken}`,
    };
};

/**
 * 공통 응답 처리
 * - body 없는 200 OK 대응
 */
const handleResponse = async (res: Response) => {
    // 에러 응답 처리
    if (!res.ok) {
        let message = '요청에 실패했습니다.';

        try {
            const text = await res.text();
            if (text) {
                const body = JSON.parse(text);
                if (body?.message) {
                    message = body.message;
                }
            }
        } catch (_) {
            // JSON 파싱 실패 시 기본 메시지 유지
        }

        throw {
            status: res.status,
            message,
        };
    }

    // 성공 응답 처리 (body 없는 경우 대응)
    const text = await res.text();
    return text ? JSON.parse(text) : null;
};

/**
 * 인증토큰 재발급
 */
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/api/auth/token/reissue`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${refreshToken}`,
        },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.accessToken ?? null;
};

/**
 *
 * @param input
 * @param init
 * @param retry
 */
const request = async (
    input: RequestInfo,
    init: RequestInit,
    retry = true
) => {
    const res = await fetch(input, init);

    // 정상 응답
    if (res.status !== 401) {
        return handleResponse(res);
    }

    // 재시도 불가 → 그대로 실패
    if (!retry) {
        throw { status: 401, message: '인증이 만료되었습니다.' };
    }

    // access token 재발급
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
    /**
     * GET 요청
     */
    get: async (path: string) => {
        return request(`${BASE_URL}${path}`, {
            method: 'GET',
            headers: {
                ...getAuthHeader(),
            },
        });
    },

    /**
     * POST 요청
     */
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

    /**
     * PUT 요청 (필요 시)
     */
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

    /**
     * DELETE 요청 (필요 시)
     */
    delete: async (path: string) => {
        return request(`${BASE_URL}${path}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader(),
            },
        });

    },
};

