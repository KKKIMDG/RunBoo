// hooks/useAuth.ts
// - 인증 상태 관리 훅: 로그인/로그아웃 상태 및 관련 로직을 추상화합니다.
// - 확장: 토큰 저장, 세션 갱신, 역할 기반 권한 등을 추가하세요.
import { useState } from 'react';

export function useAuth() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  function login() { setLoggedIn(true); }
  function logout() { setLoggedIn(false); }
  return { isLoggedIn, login, logout };
}
