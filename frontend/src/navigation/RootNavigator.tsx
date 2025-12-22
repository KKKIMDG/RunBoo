// navigation/RootNavigator.tsx
// - 앱 루트 네비게이터: 로그인 상태에 따라 스크린을 렌더링합니다.
// - 향후 React Navigation 등으로 확장할 수 있습니다.
import React from 'react';
import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/Home';

export default function RootNavigator({ isLoggedIn, onLogout, onLogin } : any) {
  return isLoggedIn ? <HomeScreen onLogout={onLogout} /> : <LoginScreen onLogin={onLogin} />;
}
