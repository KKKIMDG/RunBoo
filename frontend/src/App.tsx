import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { AuthService } from './services/auth/authService';
import { setAccessToken } from '@/services/api';

// ★ 1. 추가된 임포트 (토큰 해독기 & 저장소)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = async (id: string, pw: string) => {
        try {

            const res = await AuthService.login({
                email: id,
                password: pw,
            });

            // ★ 2. 여기서 토큰을 뜯어서 ID를 저장합니다!
            if (res.accessToken) {
                // (1) 토큰 해독
                const decoded: any = jwtDecode(res.accessToken);

                // 로그로 확인해보세요! "sub"에 숫자가 들어있을 겁니다.
                console.log("토큰 해독 결과:", decoded);

                // (2) 팀원이 말한 'subject'가 바로 이 'sub'입니다.
                // 만약 sub가 없으면 userId나 id도 찾아봅니다.
                const userId = decoded.sub || decoded.userId || decoded.id;

                // (3) 기기에 저장 (CourseService에서 꺼내 쓸 수 있게)
                await AsyncStorage.setItem('accessToken', res.accessToken);
                await AsyncStorage.setItem('userId', String(userId));

                console.log(`[로그인 성공] User ID(sub): ${userId} 저장됨`);

                setAccessToken(res.accessToken);
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error(e);
            alert('로그인 실패');
        }
    };

    const handleLogout = async () => {
        // ★ 로그아웃 할 때 저장된 것도 지워주는 센스
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('userId');

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