import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '@/services/api';
import { KAKAO_REST_API_KEY, API_BASE_URL } from "@env"; // BACKEND_URL은 본인의 서버 주소

const KAKAO_REST_KEY = KAKAO_REST_API_KEY;

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
    const startKakaoLogin = async () => {
        try {

            await WebBrowser.dismissBrowser();

            console.log("--- [1] 백엔드 리다이렉트 방식 시작 ---");

            // 1. 카카오가 로그인을 마치고 정보를 보낼 백엔드 접점(Callback) 주소
            // 예: https://your-api.com/auth/kakao/callback
            const BACKEND_REDIRECT_URI = `${API_BASE_URL}/auth/kakao/callback`;

            const authUrl =
                `https://kauth.kakao.com/oauth/authorize` +
                `?client_id=${KAKAO_REST_KEY}` +
                `&redirect_uri=${encodeURIComponent(BACKEND_REDIRECT_URI)}` +
                `&response_type=code`;

            console.log("--- [2] 브라우저 오픈 및 백엔드 대기 ---");

            // 2. 중요: 두 번째 인자를 백엔드 리다이렉트 주소로 설정합니다.
            // 브라우저가 백엔드 처리를 마치고 이 주소 근처로 오면 앱이 낚아챕니다.
            const result = await WebBrowser.openAuthSessionAsync(authUrl, BACKEND_REDIRECT_URI);

            if (result.type !== 'success') {
                console.log("--- [!] 사용자가 창을 닫았거나 취소함 ---");
                return;
            }

            // 3. 백엔드에서 처리가 끝나면 주소창에 우리 토큰을 실어서 보내줄 것입니다.
            // 예: https://your-api.com/auth/kakao/callback?accessToken=JWT_TOKEN&refreshToken=REF_TOKEN
            console.log("--- [3] 백엔드로부터 응답 수신 ---");
            const url = result.url;
            const params = new URL(url).searchParams;

            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');

            if (accessToken && refreshToken) {
                console.log("--- [4] 자체 토큰 획득 성공! 저장 시작 ---");

                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                setAccessToken(accessToken);

                onLoginSuccess(accessToken);
            } else {
                console.log("--- [!] 토큰이 주소창에 없습니다. 백엔드 응답 확인 필요 ---");
            }

        } catch (error) {
            console.error("--- [X] 에러 발생 ---", error);
        }
    };

    return { startKakaoLogin };
};