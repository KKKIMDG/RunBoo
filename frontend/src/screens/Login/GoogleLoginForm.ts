import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '@/services/api';
import { GOOGLE_WEB_CLIENT_ID, API_BASE_URL } from "@env"; // API_BASE_URL은 http://52.78.22.102:8080

export const googleLoginForm = (onLoginSuccess: (token: string) => void) => {

    const startGoogleLogin = async () => {
        try {
            await WebBrowser.dismissBrowser();

            console.log("--- [1] 구글 백엔드 리다이렉트 로그인 시작 ---");

            // 1. 구글 인증 서버 주소
            const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth`;

            // 2. 백엔드 콜백 주소 (카카오와 마찬가지로 백엔드 엔드포인트)
            const REDIRECT_URI = `${API_BASE_URL}/api/auth/google/callback`;

            // 3. 구글 로그인 창으로 이동할 URL 생성
            const authUrl =
                `${GOOGLE_AUTH_URL}?client_id=${GOOGLE_WEB_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent('email profile')}` +
                `&access_type=offline`; // 필요한 경우 추가

            console.log("--- [2] 구글 로그인 브라우저 오픈 ---");

            // 4. 브라우저 열기 (REDIRECT_URI를 가로챌 주소로 설정)
            const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

            if (result.type !== 'success') {
                console.log("--- [!] 사용자가 취소했거나 브라우저 닫힘 ---");
                return;
            }

            // 5. 백엔드 처리가 끝나고 우리 앱으로 돌아오면서 주소창에 실어준 토큰 읽기
            console.log("--- [3] 백엔드로부터 응답 수신 ---");
            const url = result.url;
            const params = new URL(url).searchParams;

            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');

            if (accessToken && refreshToken) {
                console.log("--- [4] 구글 로그인 성공 및 토큰 저장 ---");

                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                setAccessToken(accessToken);

                onLoginSuccess(accessToken);
            } else {
                console.log("--- [!] 토큰이 없습니다. 백엔드 응답을 확인하세요. ---");
            }

        } catch (error) {
            console.error("--- [X] 구글 로그인 에러 발생 ---", error);
        }
    };

    return { startGoogleLogin };
};