import React from 'react';
import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/Home';

export default function RootNavigator({ isLoggedIn, onLogout, onLogin } : any) {
  return isLoggedIn ? <HomeScreen onLogout={onLogout} /> : <LoginScreen onLogin={onLogin} />;
}
