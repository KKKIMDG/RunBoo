import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import RootNavigator from './navigation/root/RootNavigator';
import { setAccessToken } from '@/services/api';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const colorScheme = useColorScheme();

    const handleLoginSuccess = (token: string) => {
        setAccessToken(token);
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        setAccessToken(null);
        setIsLoggedIn(false);
    };

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
