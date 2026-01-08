import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '@/services/api';
import { GOOGLE_WEB_CLIENT_ID, API_BASE_URL } from "@env";

export const googleLoginForm = (onLoginSuccess: (token: string) => void) => {

    const startGoogleLogin = async () => {
        try {
            // 실행 전 브라우저가 열려있다면 닫기
            await WebBrowser.dismissBrowser();

            console.log("--- [1] 구글 백엔드 리다이렉트 로그인 시작 ---");

            // 1. 구글 인증 서버 주소
            const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth`;

            // 2. 구글이 코드를 보낼 백엔드 콜백 주소 (기존 동일)
            const BACKEND_CALLBACK_URI = `${API_BASE_URL}/api/auth/google/callback`;

            // 3. 앱이 브라우저로부터 다시 돌아올 딥링크 주소 (중요!)
            // 백엔드 properties의 frontendUrl과 글자 하나 안 틀리고 똑같아야 합니다.
            const EXPO_REDIRECT_URI = "runboo://";

            // 4. 구글 로그인 창으로 이동할 URL 생성
            const authUrl =
                `${GOOGLE_AUTH_URL}?client_id=${GOOGLE_WEB_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URI)}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent('email profile')}` +
                `&access_type=offline`;

            console.log("--- [2] 구글 로그인 브라우저 오픈 ---");
            console.log("--- [2.5] 대기 중... 가로챌 주소:", EXPO_REDIRECT_URI);

            // 5. 브라우저 열기 (가로챌 주소를 EXPO_REDIRECT_URI로 설정)
            const result = await WebBrowser.openAuthSessionAsync(authUrl, EXPO_REDIRECT_URI);

            // [!] 결과 로그 확인 (디버깅용)
            console.log("--- [3] 앱 복귀 완료! 결과 타입:", result.type);

            if (result.type !== 'success') {
                console.log("--- [!] 사용자가 취소했거나 가로채기 실패 (결과 주소가 다름) ---");
                return;
            }

            // 6. 백엔드가 실어준 토큰 읽기
            console.log("--- [3.5] 백엔드로부터 응답 URL 수신 ---");
            const url = result.url;
            console.log("수신된 URL 전체:", url);

            // 안드로이드 딥링크는 new URL(url)에서 에러가 날 수 있으므로 정규식 권장
            const accessToken = url.match(/accessToken=([^&]*)/)?.[1];
            const refreshToken = url.match(/refreshToken=([^&]*)/)?.[1];

            if (accessToken) {
                console.log("--- [4] 구글 로그인 성공 및 토큰 저장 ---");

                await AsyncStorage.setItem('accessToken', accessToken);
                if (refreshToken) {
                    await AsyncStorage.setItem('refreshToken', refreshToken);
                }

                setAccessToken(accessToken);
                onLoginSuccess(accessToken); // 여기서 메인 화면으로 이동
            } else {
                console.log("--- [!] URL에 accessToken이 없습니다. 백엔드 리다이렉트 주소를 확인하세요. ---");
            }

        } catch (error) {
            console.error("--- [X] 구글 로그인 에러 발생 ---", error);
        }
    };

    return { startGoogleLogin };
};