import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '@/services/api';
import { KAKAO_REST_API_KEY, API_BASE_URL } from "@env";
import { Alert } from 'react-native';

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
    const startKakaoLogin = async () => {
        try {
            await WebBrowser.dismissBrowser();

            const BACKEND_CALLBACK_URI =
                `${API_BASE_URL}/api/auth/kakao/callback`;

            const EXPO_REDIRECT_URI = "runboo://";

            const authUrl =
                `https://kauth.kakao.com/oauth/authorize` +
                `?client_id=${KAKAO_REST_API_KEY}` +
                `&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URI)}` +
                `&response_type=code`;

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                EXPO_REDIRECT_URI
            );

            if (result.type !== 'success' || !result.url) {
                return;
            }

            const url = result.url;

            const getParam = (key: string) =>
                url.match(new RegExp(`${key}=([^&]*)`))?.[1];

            const status = getParam('status');

            /* =========================
               ❌ 로그인 실패 처리 (여기서 앱에서 뜸)
               ========================= */
            if (status === 'FAIL') {
                const code = getParam('code');

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

            if (!accessToken) {
                Alert.alert('로그인 실패', '토큰을 받지 못했습니다.');
                return;
            }

            await AsyncStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                await AsyncStorage.setItem('refreshToken', refreshToken);
            }

            setAccessToken(accessToken);
            onLoginSuccess(accessToken);

        } catch (e) {
            Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
        }
    };

    return { startKakaoLogin };
};
