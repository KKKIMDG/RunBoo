import React, {useEffect, useState} from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './navigation/root/RootNavigator';
import { setAccessToken } from '@/services/api';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthService} from "@/services/auth/authService";
import {authEventBus} from "@/services/auth/authEvents";
import {UserMeProvider} from "@/contexts/UserMeContext";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        setIsLoggedIn(false); // 화면 전환 트리거
        await AuthService.logout();
    };

    useEffect(() => {
        const restoreLogin = async () => {
            const token = await AsyncStorage.getItem('accessToken');

            if (token) {
                setAccessToken(token);
                setIsLoggedIn(true);
                // ❗ 실제 인증은 API 호출 시 검증됨
            }

            setLoading(false);
        };

        restoreLogin();
    }, []);

    //전역 자동 로그아웃
    useEffect(() => {
        const unsubscribe = authEventBus.subscribe(() => {
            handleLogout();
        });

        return unsubscribe;
    }, []);

    const handleLoginSuccess = (token: string) => {
        setAccessToken(token);
        setIsLoggedIn(true);
    };

    if (loading) {return null;}

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
            <UserMeProvider>
                <RootNavigator
                    isLoggedIn={isLoggedIn}
                    onLoginSuccess={handleLoginSuccess}
                    onLogout={handleLogout}
                />
            </UserMeProvider>
        </NavigationContainer>
    );
}
