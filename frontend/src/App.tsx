import React, {useEffect, useState} from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './navigation/root/RootNavigator';
import { setAccessToken } from '@/services/api';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthService} from "@/services/auth/authService";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        await AuthService.logout();
        setIsLoggedIn(false); // ← 이 한 줄이 화면 전환 트리거
    };

    useEffect(() => {
        const restoreLogin = async () => {
            const token = await AsyncStorage.getItem('accessToken');

            if (token) {
                setAccessToken(token);
                setIsLoggedIn(true);
            }

            setLoading(false);
        };

        restoreLogin();
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
            <RootNavigator
                isLoggedIn={isLoggedIn}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
            />
        </NavigationContainer>
    );
}
