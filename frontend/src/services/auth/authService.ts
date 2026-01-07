// services/auth/authService.ts

import { api, setAccessToken } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        nickname: string;
    };
}

export interface SignupRequest {
    email: string;
    password: string;
    nickname: string;
}

export interface EmailVerifyRequest {
    email: string;
    code: string;
}

export const AuthService = {

    /** 이메일 로그인 */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        // @ts-ignore
        const res = await api.post<LoginRequest>('/api/auth/login', data);

        // 토큰 저장 책임은 로그인에만 둔다
        if (res.accessToken) {
            await AsyncStorage.setItem('accessToken', res.accessToken);
            setAccessToken(res.accessToken);
        }

        if (res.refreshToken) {
            await AsyncStorage.setItem('refreshToken', res.refreshToken);
        }

        return res;
    },

    /** 이메일 인증 코드 발송 */
    sendEmailCode: (email: string): Promise<void> => {
        return api.post('/api/auth/email/verify', { email });
    },

    /** 이메일 인증 코드 검증 */
    verifyEmailCode: (email: string, code: string): Promise<void> => {
        // @ts-ignore
        return api.post<EmailVerifyRequest>(
            '/api/auth/email/verify/check',
            { email, code }
        );
    },

    /** 회원가입 */
    signup: (data: SignupRequest): Promise<void> => {
        return api.post('/api/auth/signup', data);
    },

    /** 구글 로그인 */
    googleLogin: (googleAccessToken: string) => {
        return api.post('/api/auth/login/oauth', {
            provider: 'GOOGLE',
            accessToken: googleAccessToken,
        });
    },

    /** 카카오 로그인 */
    kakaoLogin: (kakaoAccessToken: string) => {
        return api.post('/api/auth/login/oauth', {
            provider: 'KAKAO',
            accessToken: kakaoAccessToken,
        });
    },

    /** 로그아웃 */
    logout: async () => {
        await AsyncStorage.multiRemove([
            'accessToken',
            'refreshToken',
        ]);

        setAccessToken(null);
    },
};
