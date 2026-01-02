import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@env';
import { Alert } from 'react-native';

export const googleLoginForm = (onLoginSuccess: (token: string) => void) => {

    // ▼▼▼ [주석 처리 시작] 에러의 원인! ID가 없으면 여기서 터집니다. ▼▼▼
    /*
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID, // 여기가 비어있어서 에러 발생!
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        scopes: ['email', 'profile'],
    });

    useEffect(() => {
        if (response?.type !== 'success') return;
        const accessToken = response.authentication?.accessToken;
        if (!accessToken) return;

        const login = async () => {
            try {
                const res = await AuthService.googleLogin(accessToken);
                const decoded: any = jwtDecode(res.accessToken);
                await AsyncStorage.setItem('accessToken', res.accessToken);
                await AsyncStorage.setItem('refreshToken',  res.refreshToken);
                setAccessToken(res.accessToken);
                onLoginSuccess(res.accessToken);
            } catch (error) {
                console.error("Login Failed:", error);
            }
        };
        login();
    }, [response]);
    */
    // ▲▲▲ [주석 처리 끝] ▲▲▲

    return {
        // ▼▼▼ 버튼 눌렀을 때 실행될 함수 (지금은 가짜)
        startGoogleLogin: () => {
            console.log("⚠️ iOS Client ID가 없어서 로그인을 실행할 수 없습니다.");
            Alert.alert("알림", "현재 구글 로그인은 비활성화 상태입니다. (iOS Client ID 누락)");

            // 원래는 이거 실행해야 함
            // promptAsync(); 
        },
    };
};