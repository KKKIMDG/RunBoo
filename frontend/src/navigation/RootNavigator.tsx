import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 화면 컴포넌트 임포트
import HomeScreen from '@/screens/Home/HomeScreen';
import LoginScreen from '@/screens/Login/LoginScreen';
import TierResultScreen from '../screens/TierResult';
import RecordsScreen from '@/screens/records/RecordsScreen';
import StatsScreen from '../screens/stats/StatsScreen';

// 네비게이터 임포트
import MainStackNavigator from './MainStackNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator({ isLoggedIn, onLogout, onLogin }: any) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} onLogout={onLogout} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={onLogin} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}