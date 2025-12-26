import React from 'react';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function RootNavigator({
                                        isLoggedIn,
                                        onLoginSuccess,
                                        onLogout,
                                      }: any) {
  return isLoggedIn ? (
      <AppStack onLogout={onLogout} />
  ) : (
      <AuthStack onLoginSuccess={onLoginSuccess} />
  );
}
