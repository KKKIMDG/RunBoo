// useGoogleLogin.ts
import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';
import { GOOGLE_CLIENT_ID } from '@env';

export const googleLoginForm = (onLoginSuccess: (token: string) => void) => {
    // const [request, response, promptAsync] = Google.useAuthRequest({
    //     clientId: GOOGLE_CLIENT_ID,
    //     scopes: ['email', 'profile'],
    // });
    //
    // useEffect(() => {
    //     if (response?.type !== 'success') return;
    //
    //     const accessToken = response.authentication?.accessToken;
    //     if (!accessToken) return;
    //
    //     const login = async () => {
    //         const res = await AuthService.googleLogin(accessToken);
    //
    //         const decoded: any = jwtDecode(res.accessToken);
    //         await AsyncStorage.setItem('accessToken', res.accessToken);
    //         await AsyncStorage.setItem('userId', String(decoded.sub || decoded.id));
    //
    //         setAccessToken(res.accessToken);
    //         onLoginSuccess(res.accessToken);
    //     };
    //
    //     login();
    // }, [response]);

    // return {
    //     startGoogleLogin: () => promptAsync(),
    // };
    return {
        // ▼▼▼ [수정] 에러 안 나게 빈 함수로 변경 ▼▼▼
        startGoogleLogin: () => {
            console.log("현재 구글 로그인은 테스트를 위해 비활성화 상태입니다.");
            // promptAsync();
        },
    };
};
