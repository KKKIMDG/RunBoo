import React, { useEffect, useState } from 'react';
import {Platform, useColorScheme, View} from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as SplashScreen from 'expo-splash-screen';
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

// 스플래시 자동 종료 방지 (최초 1회)
SplashScreen.preventAutoHideAsync();

export default function App() {
    const colorScheme = useColorScheme();

    /** 앱 전체 준비 완료 여부 (스플래시 제어용) */
    const [appReady, setAppReady] = useState(false);

    /** 로그인 상태 */
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    /**
     * 자동 로그아웃 (토큰 만료, 401 등)
     * - 서버 호출
     * - 로컬 인증 정보만 제거
     */
    const silentLogout = async () => {
        await AuthService.logout();
        setIsLoggedIn(false);
    };

    /**
     * 사용자 명시적 로그아웃
     * - FCM 디바이스 비활성화 포함
     */
    const handleLogout = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('accessToken');
            const fcmToken = await AsyncStorage.getItem('fcmToken');

            if (accessToken && fcmToken) {
                await disablePushDevice(fcmToken);
            }
        } catch (e) {
            console.warn('FCM disable failed', e);
        }

        await AuthService.logout();
        setIsLoggedIn(false);
    };

    /**
     * 앱 초기 부트스트랩
     * - 자동 로그인 복원
     * - FCM 토큰 등록
     * - 모든 준비가 끝난 뒤 스플래시 종료
     */
    useEffect(() => {
        const bootstrap = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');

                if (token) {
                    setAccessToken(token);
                    setIsLoggedIn(true);

                    // FCM 등록 (Android만)
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
            } catch (e) {
                console.warn('App bootstrap failed', e);
                await silentLogout();
            } finally {
                // 앱 준비 완료 → 스플래시 종료
                setAppReady(true);
                await SplashScreen.hideAsync();
            }
        };

        bootstrap();
    }, []);

    /**
     * 전역 자동 로그아웃 이벤트 구독
     */
    useEffect(() => {
        const unsubscribe = authEventBus.subscribeLogout(() => {
            handleLogout();
        });

        return unsubscribe;
    }, []);

    /**
     * 로그인 성공 콜백
     */
    const handleLoginSuccess = (token: string) => {
        setAccessToken(token);
        setIsLoggedIn(true);
        authEventBus.emitLogin();
    };

    /**
     * 앱 준비 전에는 아무것도 렌더링하지 않음
     * → 스플래시 유지
     */
    if (!appReady) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000000' }} />
        );
    }

    /** 테마 설정 */
    const MyTheme = {
        ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
        colors: {
            ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
            primary: Colors[colorScheme === 'dark' ? 'dark' : 'light'].primary,
            background: Colors[colorScheme === 'dark' ? 'dark' : 'light'].background,
            card: Colors[colorScheme === 'dark' ? 'dark' : 'light'].card,
            text: Colors[colorScheme === 'dark' ? 'dark' : 'light'].text,
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
