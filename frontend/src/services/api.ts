// services/api.ts
// - API 호출 유틸: 공통 헤더, 에러 처리, 인증 토큰 주입 등을 한 곳에서 관리하세요.

// API 기본 URL, .env와 같은 환경 변수로 관리하는 것이 좋습니다.
const BASE_URL = 'http://localhost:8080'; // TODO: 실제 API 서버 주소로 변경해야 합니다.

export const api = {
  /**
   * GET 요청을 보냅니다.
   * @param path API 경로
   * @returns Promise<any>
   */
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * POST 요청을 보냅니다.
   * @param path API 경로
   * @param data 요청 본문에 포함할 데이터
   * @returns Promise<any>
   */
  post: async <T>(path: string, data: T) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
};
