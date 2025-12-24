import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { AuthService } from './services/auth/authService';
import { setAccessToken } from '@/services/api';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = async (id: string, pw: string) => {
        try {
            const res = await AuthService.login({ email: id, password: pw });
            setAccessToken(res.accessToken);
            setIsLoggedIn(true);
        } catch (e) {
            alert('로그인 실패: 아이디와 비밀번호를 확인하세요.');
        }
    };

    const handleLogout = () => {
        setAccessToken(null);
        setIsLoggedIn(false);
    };

    return (
        <NavigationContainer>
            <RootNavigator
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                onLogout={handleLogout}
            />
        </NavigationContainer>
    );
}