// services/api.ts

// 안드로이드 에뮬레이터에서 개발 서버 접속 시 사용하는 IP 주소입니다.
// export const BASE_URL = 'http://10.0.2.2:8080';
// iOS 시뮬레이터 또는 웹 환경에서는 아래 주석을 해제하고 위 라인을 주석 처리하세요.
export const BASE_URL = 'http://localhost:8080';

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


export const api = {
  /**
   * GET 요청
   */
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
      },
    });

    return handleResponse(res);
  },

  /**
   * POST 요청
   */
  post: async <T>(path: string, data: T) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    return handleResponse(res);
  },

  /**
   * PUT 요청 (필요 시)
   */
  put: async <T>(path: string, data: T) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    return handleResponse(res);
  },

  /**
   * DELETE 요청 (필요 시)
   */
  delete: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    return handleResponse(res);
  },
};
