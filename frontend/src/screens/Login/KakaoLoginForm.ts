import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAccessToken } from '@/services/api';
import { KAKAO_REST_API_KEY, API_BASE_URL } from "@env";

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
    const startKakaoLogin = async () => {
        try {
            // 실행 전 브라우저 초기화
            await WebBrowser.dismissBrowser();

            console.log("--- [1] 카카오 백엔드 리다이렉트 로그인 시작 ---");

            // 1. 카카오가 코드를 보낼 백엔드 콜백 주소 (기존 동일)
            // ※ 주의: 이 주소는 카카오 개발자 콘솔에 등록되어 있어야 합니다.
            const BACKEND_CALLBACK_URI = `${API_BASE_URL}/api/auth/kakao/callback`;

            // 2. 앱이 브라우저로부터 다시 돌아올 딥링크 주소 (구글과 동일하게 설정)
            // 백엔드의 application.properties 내 frontendUrl과 일치해야 함
            const EXPO_REDIRECT_URI = "runboo://";

            // 3. 카카오 인증 서버 주소 조립
            const authUrl =
                `https://kauth.kakao.com/oauth/authorize` +
                `?client_id=${KAKAO_REST_API_KEY}` +
                `&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URI)}` +
                `&response_type=code`;

            console.log("--- [2] 카카오 로그인 브라우저 오픈 ---");
            console.log("--- [2.5] 가로챌 주소 대기 중:", EXPO_REDIRECT_URI);

            // 4. 브라우저 열기
            const result = await WebBrowser.openAuthSessionAsync(authUrl, EXPO_REDIRECT_URI);

            console.log("--- [3] 앱 복귀 완료! 결과 타입:", result.type);

            if (result.type !== 'success') {
                console.log("--- [!] 사용자가 취소했거나 브라우저 닫힘 ---");
                return;
            }

            // 5. 백엔드가 실어준 토큰 읽기 (result.url 추출)
            console.log("--- [3.5] 백엔드로부터 응답 URL 수신 ---");
            const url = result.url;
            console.log("수신된 URL 전체:", url);

            // 안드로이드 딥링크 안전 파싱 (정규표현식 사용)
            const accessToken = url.match(/accessToken=([^&]*)/)?.[1];
            const refreshToken = url.match(/refreshToken=([^&]*)/)?.[1];

            if (accessToken) {
                console.log("--- [4] 카카오 로그인 성공 및 토큰 저장 ---");

                await AsyncStorage.setItem('accessToken', accessToken);
                if (refreshToken) {
                    await AsyncStorage.setItem('refreshToken', refreshToken);
                }

                setAccessToken(accessToken);
                onLoginSuccess(accessToken); // 메인 화면으로 이동
            } else {
                console.log("--- [!] 토큰이 없습니다. 백엔드 리다이렉트 주소 설정을 확인하세요. ---");
            }

        } catch (error) {
            console.error("--- [X] 카카오 로그인 에러 발생 ---", error);
        }
    };

    return { startKakaoLogin };
};