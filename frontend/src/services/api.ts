// services/api.ts
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authEventBus } from "@/services/auth/authEvents";

const BASE_URL = API_BASE_URL;

let accessToken: string | null = null;

/**
 * 인증 토큰 설정 (로그인 / 로그아웃 시 호출)
 */
export const setAccessToken = (token: string | null) => {
  accessToken = token && token.trim() !== "" ? token : null;
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
    let message = "요청에 실패했습니다.";

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
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/api/auth/token/reissue`, {
      method: "POST",
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
const request = async (input: RequestInfo, init: RequestInit, retry = true) => {
  await ensureAccessTokenLoaded();
  const res = await fetch(input, init);

  // 401,403은 특별 취급
  if (res.status !== 401 && res.status !== 403) {
    return handleResponse(res);
  }

  // 재시도 불가
  if (!retry) {
    throw { status: 401, message: "인증이 만료되었습니다." };
  }

  // 🔄 토큰 재발급
  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) {
    // refresh 토큰 만료일 때만 로그아웃
    authEventBus.emitLogout();
    throw { status: 401, message: "로그인이 필요합니다." };
  }

  await AsyncStorage.setItem("accessToken", newAccessToken);
  setAccessToken(newAccessToken);

  return request(
    input,
    {
      ...init,
      headers: mergeHeaders(init.headers, newAccessToken),
    },
    false
  );
};
const mergeHeaders = (oldHeaders: RequestInit["headers"], token: string) => {
  const headers = new Headers(oldHeaders || {});
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
};

let bootstrappingPromise: Promise<void> | null = null;

const ensureAccessTokenLoaded = async () => {
  if (accessToken) return;

  if (!bootstrappingPromise) {
    bootstrappingPromise = (async () => {
      const stored = await AsyncStorage.getItem("accessToken");
      if (stored) setAccessToken(stored);
    })().finally(() => {
      bootstrappingPromise = null;
    });
  }

  await bootstrappingPromise;
};
export const api = {
  get: async (path: string) => {
    return request(`${BASE_URL}${path}`, {
      method: "GET",
      headers: {
        ...getAuthHeader(),
      },
    });
  },

  post: async (url: string, data: any) => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 필요한 경우 인증 헤더 추가
        },
        body: JSON.stringify(data),
      });

      // 응답 텍스트를 먼저 받음
      const text = await response.text();

      // 텍스트가 없거나 형식이 JSON이 아니면 텍스트 그대로 혹은 빈 객체 반환
      try {
        return JSON.parse(text);
      } catch (e) {
        // JSON 파싱 실패 시 (문자열 응답 등) 텍스트를 객체에 담아 반환하거나 처리
        console.warn("JSON 파싱 실패, 텍스트 응답 반환:", text);
        return { message: text };
      }
    } catch (error) {
      console.error("API Post Error:", error);
      throw error;
    }
  },

  put: async <T>(path: string, data: T) => {
    return request(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
  },

  delete: async (path: string) => {
    return request(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });
  },
};
