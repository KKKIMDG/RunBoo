import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '@/services/api';
import { KAKAO_REST_API_KEY, API_BASE_URL } from "@env";
import { Alert } from 'react-native';

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
    const startKakaoLogin = async () => {
        try {
            console.log('[KAKAO] 로그인 시작');

            await WebBrowser.dismissBrowser();
            console.log('[KAKAO] 기존 브라우저 세션 종료');

            const BACKEND_CALLBACK_URI =
                `${API_BASE_URL}/api/auth/kakao/callback`;

            const EXPO_REDIRECT_URI = "runboo://";

            console.log('[KAKAO] BACKEND_CALLBACK_URI:', BACKEND_CALLBACK_URI);
            console.log('[KAKAO] EXPO_REDIRECT_URI:', EXPO_REDIRECT_URI);

            const authUrl =
                `https://kauth.kakao.com/oauth/authorize` +
                `?client_id=${KAKAO_REST_API_KEY}` +
                `&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URI)}` +
                `&response_type=code`;

            console.log('[KAKAO] authUrl:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                EXPO_REDIRECT_URI
            );

            console.log('[KAKAO] WebBrowser result:', result);

            if (result.type !== 'success' || !result.url) {
                console.log('[KAKAO] 로그인 취소 또는 실패');
                return;
            }

            const url = result.url;
            console.log('[KAKAO] redirect url:', url);

            const getParam = (key: string) =>
                url.match(new RegExp(`${key}=([^&]*)`))?.[1];

            const status = getParam('status');
            console.log('[KAKAO] status:', status);

            /* =========================
               ❌ 로그인 실패 처리
               ========================= */
            if (status === 'FAIL') {
                const code = getParam('code');
                console.log('[KAKAO] FAIL code:', code);

                if (code === 'LOCAL_ACCOUNT') {
                    Alert.alert(
                        '로그인 실패',
                        '이 이메일은 로컬 로그인 계정입니다.\n이메일 로그인을 이용해 주세요.'
                    );
                } else if (code === 'DEACTIVATED') {
                    Alert.alert('로그인 실패', '탈퇴된 계정입니다.');
                } else {
                    Alert.alert('로그인 실패', '로그인에 실패했습니다.');
                }

                return;
            }

            /* =========================
               ✅ 로그인 성공 처리
               ========================= */
            const accessToken = getParam('accessToken');
            const refreshToken = getParam('refreshToken');

            console.log('[KAKAO] accessToken:', accessToken);
            console.log('[KAKAO] refreshToken:', refreshToken);

            if (!accessToken) {
                console.log('[KAKAO] accessToken 없음');
                Alert.alert('로그인 실패', '토큰을 받지 못했습니다.');
                return;
            }

            await AsyncStorage.setItem('accessToken', accessToken);
            console.log('[KAKAO] accessToken 저장 완료');

            if (refreshToken) {
                await AsyncStorage.setItem('refreshToken', refreshToken);
                console.log('[KAKAO] refreshToken 저장 완료');
            }

            setAccessToken(accessToken);
            console.log('[KAKAO] axios accessToken 세팅 완료');

            onLoginSuccess(accessToken);
            console.log('[KAKAO] 로그인 성공 콜백 완료');

        } catch (e) {
            console.error('[KAKAO] 로그인 중 예외 발생', e);
            Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
        }
    };

    return { startKakaoLogin };
};
