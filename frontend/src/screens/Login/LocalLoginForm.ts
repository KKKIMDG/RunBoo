// LocalLoginForm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { googleLoginForm } from './GoogleLoginForm';
import { kakaoLoginForm } from './KakaoLoginForm';

type AuthStackParamList = {
    SignUp: undefined;
};
type NavigationProp = StackNavigationProp<AuthStackParamList>;

export const localLoginForm = (onLoginSuccess: (token: string) => void) => {
    const navigation = useNavigation<NavigationProp>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 소셜 로그인 훅 주입
    const { startGoogleLogin } = googleLoginForm(onLoginSuccess);
    const { startKakaoLogin } = kakaoLoginForm(onLoginSuccess);

    /* =====================
       이메일 로그인
    ===================== */
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const res = await AuthService.login({ email, password });

            await AsyncStorage.setItem('accessToken', res.accessToken);
            await AsyncStorage.setItem('refreshToken',  res.refreshToken);

            setAccessToken(res.accessToken);
            onLoginSuccess(res.accessToken);

        } catch (error: any) {
            Alert.alert(
                '로그인 실패',
                error?.message ?? '이메일 또는 비밀번호가 올바르지 않습니다.'
            );
        }
    };
    /* =====================
       소셜 로그인 진입점
    ===================== */
    const handleSocialLogin = (platform: 'Google' | 'Kakao') => {
        if (platform === 'Google') startGoogleLogin();
        if (platform === 'Kakao') startKakaoLogin();
    };

    const handleSignUp = () => navigation.navigate('SignUp');
    // @ts-ignore
    const handlePasswordReset = () => navigation.navigate('PasswordReset')
    return {
        formState: { email, password },
        formHandlers: { setEmail, setPassword },
        apiHandlers: { handleLogin },
        navigationHandlers: { handleSignUp, handleSocialLogin, handlePasswordReset },

    };
};
