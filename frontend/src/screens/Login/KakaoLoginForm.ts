// useKakaoLogin.ts
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';
import {FRONT_URL, KAKAO_REST_API_KEY} from "@env";

const KAKAO_REST_KEY = KAKAO_REST_API_KEY;
const REDIRECT_URL = FRONT_URL;

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
    const startKakaoLogin = async () => {
        const authUrl =
            `https://kauth.kakao.com/oauth/authorize` +
            `?client_id=${KAKAO_REST_KEY}` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}` +
            `&response_type=code`;

        const result = await WebBrowser.openAuthSessionAsync(
            authUrl,
            REDIRECT_URL
        );
        if (result.type !== 'success') return;

        const url = result.url!;
        const code = new URL(url).searchParams.get('code');
        if (!code) return;

        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: KAKAO_REST_KEY,
                redirect_uri: REDIRECT_URL,
                code,
            }).toString(),
        });

        const tokenJson = await tokenRes.json();
        const kakaoAccessToken = tokenJson.access_token;
        if (!kakaoAccessToken) return;

        const res = await AuthService.kakaoLogin(kakaoAccessToken);

        const decoded: any = jwtDecode(res.accessToken);
        await AsyncStorage.setItem('accessToken', res.accessToken);
        await AsyncStorage.setItem('refreshToken',  res.refreshToken);
        setAccessToken(res.accessToken);
        onLoginSuccess(res.accessToken);
    };

    return { startKakaoLogin };
};
