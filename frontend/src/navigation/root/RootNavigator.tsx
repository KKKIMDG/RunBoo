import React from 'react';
import AuthStack from '../auth/AuthStack';
import MainStack from '@/navigation/stacks/MainStack';

export default function RootNavigator({
                                        isLoggedIn,
                                        onLoginSuccess,
                                        onLogout,
                                      }: any) {
  return isLoggedIn ? (
      <MainStack onLogout={onLogout} />
  ) : (
      <AuthStack onLoginSuccess={onLoginSuccess} />
  );
}