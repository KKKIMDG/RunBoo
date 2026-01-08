import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Platform, useColorScheme } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RootNavigator from './navigation/root/RootNavigator';
import { setAccessToken } from '@/services/api';
import { Colors } from '@/constants/theme';
import { AuthService } from '@/services/auth/authService';
import { authEventBus } from '@/services/auth/authEvents';
import { UserMeProvider } from '@/contexts/UserMeContext';
import { UserSettingProvider } from '@/contexts/UserSettingContext';
import {
    disablePushDevice,
    registerPushDevice,
} from '@/services/notification/notificationService';
import { getFcmToken } from '@/services/notification/fcmToken';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(true);

    /**
     * 🔒 자동 로그아웃 (토큰 만료, 401 등)
     * - 서버 호출 ❌
     * - 로컬 인증 정보만 제거
     */
    const silentLogout = async () => {
        await AuthService.logout();
        setIsLoggedIn(false);
    };

    /**
     * 👆 사용자 명시적 로그아웃
     * - FCM 디바이스 비활성화 포함
     */
    const handleLogout = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const fcmToken = await AsyncStorage.getItem('fcmToken');

            // 로그인 상태일 때만 서버 호출
            if (accessToken && fcmToken) {
                await disablePushDevice(fcmToken);
            }
        } catch (e) {
            console.warn('FCM disable failed', e);
        }

        await AuthService.logout();
        setIsLoggedIn(false);
    };

    useEffect(() => {
        const restoreLogin = async () => {
            const token = await AsyncStorage.getItem('accessToken');

            if (token) {
                setAccessToken(token);
                setIsLoggedIn(true);
                // ❗ 실제 인증은 API 호출 시 검증됨

                // 🔔 FCM 등록 (Android만)
                if (Platform.OS !== 'ios') {
                    try {
                        const fcmToken = await getFcmToken();
                        await AsyncStorage.setItem('fcmToken', fcmToken);

                        await registerPushDevice({
                            token: fcmToken,
                            platform: 'ANDROID',
                        });
                    } catch (e) {
                        console.warn('FCM register failed', e);
                    }
                }
            }

      setLoading(false);
    };

    restoreLogin();
  }, []);

    //전역 자동 로그아웃
    useEffect(() => {
        const unsubscribe = authEventBus.subscribeLogout(() => {
            handleLogout();
        });

        return unsubscribe;
    }, []);

    const handleLoginSuccess = (token: string) => {
        setAccessToken(token);
        setIsLoggedIn(true);
        authEventBus.emitLogin();
    };

  if (loading) {
    return null;
  }

  const MyTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      primary: Colors[colorScheme === "dark" ? "dark" : "light"].primary,
      background: Colors[colorScheme === "dark" ? "dark" : "light"].background,
      card: Colors[colorScheme === "dark" ? "dark" : "light"].card,
      text: Colors[colorScheme === "dark" ? "dark" : "light"].text,
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <UserSettingProvider>
        <UserMeProvider>
          <RootNavigator
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        </UserMeProvider>
      </UserSettingProvider>
    </NavigationContainer>
  );
}
