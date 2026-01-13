import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAccessToken } from "@/services/api";
import { KAKAO_REST_API_KEY, API_BASE_URL } from "@env";
import { Alert, Platform } from "react-native";

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
  const startKakaoLogin = async () => {
    try {
      console.log("[KAKAO] 로그인 시작");

      // ✅ Dev Client에서는 dismissBrowser 호출 안함
      if (!__DEV__ || Platform.OS === "web") {
        await WebBrowser.dismissBrowser();
        console.log("[KAKAO] 기존 브라우저 세션 종료");
      }

      const BACKEND_CALLBACK_URI = `${API_BASE_URL}/api/auth/kakao/callback`;
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

      console.log("[KAKAO] WebBrowser result:", result);

      if (result.type !== "success" || !result.url) {
        console.log("[KAKAO] 로그인 취소 또는 실패");
        return;
      }

      const url = result.url;
      const getParam = (key: string) =>
        url.match(new RegExp(`${key}=([^&]*)`))?.[1];

      const accessToken = getParam("accessToken");
      const refreshToken = getParam("refreshToken");

      if (!accessToken) {
        Alert.alert("로그인 실패", "토큰을 받지 못했습니다.");
        return;
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      if (refreshToken)
        await AsyncStorage.setItem("refreshToken", refreshToken);

      setAccessToken(accessToken);
      onLoginSuccess(accessToken);

      console.log("[KAKAO] 로그인 성공");
    } catch (e) {
      console.error("[KAKAO] 로그인 중 예외 발생", e);
      Alert.alert("로그인 실패", "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  return { startKakaoLogin };
};
