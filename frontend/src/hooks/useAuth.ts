import { useState } from 'react';

export function useAuth() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  function login() { setLoggedIn(true); }
  function logout() { setLoggedIn(false); }
  return { isLoggedIn, login, logout };
}
