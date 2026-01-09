// services/api.ts
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authEventBus } from "@/services/auth/authEvents";

const BASE_URL = API_BASE_URL;

// API_BASE_URL이 설정되지 않은 경우 에러 확인
if (!BASE_URL) {
  console.error("⚠️ API_BASE_URL이 설정되지 않았습니다. .env 파일을 확인해주세요.");
}

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
  const text = await res.text();

  if (!res.ok) {
    let message = "요청에 실패했습니다.";
    try {
      if (text) {
        const body = JSON.parse(text);
        if (body?.message) message = body.message;
      }
    } catch (_) {
      // JSON 파싱 실패 시 원문 텍스트 사용
      message = text || message;
    }
    throw { status: res.status, message };
  }

  // ✅ 성공 응답 처리: JSON 파싱 시도, 실패 시 텍스트 반환
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.warn("JSON 파싱 실패, 텍스트 응답 반환:", text);
    return { message: text };
  }
};

/**
 * 🔑 accessToken 재발급 (refreshToken 사용)
 */
let refreshingPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const res = await fetch(`${BASE_URL}/api/auth/token/reissue`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.accessToken ?? null;
    } catch (error) {
      console.error("토큰 재발급 실패:", error);
      return null;
    }
  })();

  const token = await refreshingPromise;
  refreshingPromise = null;
  return token;
};

/**
 * 공통 request
 */
const request = async (input: RequestInfo, init: RequestInit, retry = true) => {
  try {
    await ensureAccessTokenLoaded();

    // 최신 토큰 헤더 주입
    const finalInit = {
      ...init,
      headers: {
        ...init.headers,
        ...getAuthHeader(),
      },
    };

    const res = await fetch(input, finalInit);
    // 🔥 회원탈퇴 API는 refresh 금지
    if (
        (res.status === 401 || res.status === 403) &&
        typeof input === "string" &&
        input.includes("/api/users/me/withdraw")
    ) {
      throw { status: res.status, message: "요청에 실패했습니다." };
    }

    // 401, 403 인증 에러 처리
    if (res.status === 401 || res.status === 403) {
      if (!retry) {
        throw { status: 401, message: "인증이 만료되었습니다." };
      }

      const newAccessToken = await refreshAccessToken();
      if (!newAccessToken) {
        authEventBus.emitLogout();
        throw { status: 401, message: "로그인이 필요합니다." };
      }

      await AsyncStorage.setItem("accessToken", newAccessToken);
      setAccessToken(newAccessToken);

      // 재시도 시 새 토큰 주입
      return request(
        input,
        {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        },
        false
      );
    }

    return handleResponse(res);
  } catch (error: any) {
    // 네트워크 에러 처리
    if (error?.message === "Network request failed" || error?.message?.includes("network") || error?.code === "NETWORK_ERROR") {
      console.error("네트워크 요청 실패:", typeof input === "string" ? input : "알 수 없는 URL", error);
      throw { 
        status: 0, 
        message: "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요." 
      };
    }
    
    // 이미 처리된 에러는 그대로 throw
    if (error?.status) {
      throw error;
    }
    
    // 기타 예상치 못한 에러
    console.error("API 요청 중 에러 발생:", typeof input === "string" ? input : "알 수 없는 URL", error);
    throw { 
      status: 0, 
      message: error?.message || "요청 처리 중 오류가 발생했습니다." 
    };
  }
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
    });
  },

  post: async <T = any>(path: string, data: any): Promise<T> => {
    return request(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }) as Promise<T>;
  },

  put: async <T>(path: string, data: T) => {
    return request(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  patch: async <T>(path: string, data: T) => {
    return request(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  delete: async (path: string) => {
    return request(`${BASE_URL}${path}`, {
      method: "DELETE",
    });
  },
};