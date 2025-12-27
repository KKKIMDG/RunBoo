import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';
import { GOOGLE_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

/* =========================
   Navigation 타입
========================= */
type AuthStackParamList = {
    SignUp: undefined;
};

type NavigationProp = StackNavigationProp<AuthStackParamList>;

/* =========================
   Hook
========================= */
export const useLoginForm = (onLoginSuccess: (token: string) => void) => {
    console.log('[LOGIN_FORM] render start');

    const navigation = useNavigation<NavigationProp>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    /* =========================
       redirectUri 확인
    ========================= */
    const redirectUri = makeRedirectUri();
    console.log('[GOOGLE] redirectUri:', redirectUri);

    /* =========================
       Google AuthRequest 생성
    ========================= */
    const [request, response, promptAsync] =
        Google.useAuthRequest({
            clientId: GOOGLE_CLIENT_ID,
            scopes: ['email', 'profile'],
            redirectUri,
        });

    console.log('[GOOGLE] authRequest state', {
        request,
        response,
        platform: Platform.OS,
    });

    /* =========================
       OAuth 결과 감시
    ========================= */
    useEffect(() => {
        console.log('[GOOGLE] useEffect fired', response);

        if (!response) {
            console.log('[GOOGLE] response is null');
            return;
        }

        if (response.type !== 'success') {
            console.log('[GOOGLE] response type:', response.type);
            return;
        }

        console.log('[GOOGLE] OAuth SUCCESS', response);

        const auth = response.authentication;
        console.log('[GOOGLE] authentication:', auth);

        if (!auth?.accessToken) {
            console.log('[GOOGLE] accessToken 없음');
            return;
        }

        console.log('[GOOGLE] accessToken 존재');

        const loginWithGoogle = async () => {
            try {
                console.log('[GOOGLE] 서버 로그인 요청 시작');

                const res = await AuthService.googleLogin(auth.accessToken);

                console.log('[GOOGLE] 서버 응답:', res);

                if (!res?.accessToken) {
                    console.log('[GOOGLE] 서버 JWT 없음');
                    return;
                }

                const decoded: any = jwtDecode(res.accessToken);
                const userId = decoded.sub || decoded.id;

                console.log('[GOOGLE] JWT decode 결과', {
                    userId,
                    decoded,
                });

                await AsyncStorage.setItem('accessToken', res.accessToken);
                await AsyncStorage.setItem('userId', String(userId));

                console.log('[GOOGLE] AsyncStorage 저장 완료');

                setAccessToken(res.accessToken);
                console.log('[GOOGLE] setAccessToken 완료');

                onLoginSuccess(res.accessToken);
                console.log('[GOOGLE] onLoginSuccess 호출 완료');
            } catch (e) {
                console.log('[GOOGLE] 서버 로그인 실패', e);
                Alert.alert('로그인 실패', '구글 로그인 처리 중 오류가 발생했습니다.');
            }
        };

        loginWithGoogle();
    }, [response]);

    /* =========================
       이메일 로그인
    ========================= */
    const handleLogin = async () => {
        console.log('[LOGIN] 이메일 로그인 시도');

        if (!email || !password) {
            Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const res = await AuthService.login({ email, password });

            console.log('[LOGIN] 서버 응답:', res);

            const decoded: any = jwtDecode(res.accessToken);
            const userId = decoded.sub || decoded.id;

            await AsyncStorage.setItem('accessToken', res.accessToken);
            await AsyncStorage.setItem('userId', String(userId));

            setAccessToken(res.accessToken);
            onLoginSuccess(res.accessToken);
        } catch (e) {
            console.log('[LOGIN] 이메일 로그인 실패', e);
            Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    /* =========================
       소셜 로그인 버튼
    ========================= */
    const handleSocialLogin = (platform: 'Google' | 'Kakao') => {
        console.log('[SOCIAL] 클릭:', platform);

        if (platform === 'Google') {
            console.log('[GOOGLE] promptAsync 호출 직전');
            promptAsync();
            console.log('[GOOGLE] promptAsync 호출 완료');
            return;
        }

        Alert.alert('알림', '카카오 로그인은 아직 준비 중입니다.');
    };

    /* =========================
       회원가입
    ========================= */
    const handleSignUp = () => {
        console.log('[NAVIGATION] SignUp 이동');
        navigation.navigate('SignUp');
    };

    console.log('[LOGIN_FORM] render end');

    return {
        formState: { email, password },
        formHandlers: { setEmail, setPassword },
        apiHandlers: { handleLogin },
        navigationHandlers: { handleSignUp, handleSocialLogin },
    };
};
