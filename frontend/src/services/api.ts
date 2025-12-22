// services/api.ts
// - API 호출 유틸: 공통 헤더, 에러 처리, 인증 토큰 주입 등을 한 곳에서 관리하세요.
export const api = {
  get: async (path: string) => {
    const res = await fetch(path);
    return res.json();
  }
};
