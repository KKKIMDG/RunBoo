// navigation/RootNavigator.tsx
import React from 'react';
import LoginScreen from '../screens/Login';
import TierResultScreen from '../screens/TierResult';
import RecordsScreen from "@/screens/records/RecordsScreen";
import StatsScreen from "../screens/stats/StatsScreen";
import MainStackNavigator from './MainStackNavigator';
import HomeScreen from "@/screens/Home";

interface RootNavigatorProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  onLogin: (id: string, pw: string) => void;
}

export default function RootNavigator({ isLoggedIn, onLogout, onLogin }: RootNavigatorProps) {
  /**
   * 1. isLoggedIn이 true일 때: 
   * - TierResult/index.ts (TierResultIndex)를 렌더링합니다.
   * - 이 컴포넌트 내부에서 거리(5.0km), 시간(0:10), 페이스(4'00") 등의 더미 데이터를 채워 TierResult 뷰를 보여줍니다.
   * * 2. isLoggedIn이 false일 때: 
   * - LoginScreen을 렌더링하여 아이디와 비밀번호 입력을 받습니다.
   */
  return isLoggedIn ? (
    <MainStackNavigator />
  ) : (
    <LoginScreen onLogin={onLogin} />
  );
}