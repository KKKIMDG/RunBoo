import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAccessToken } from "@/services/api";
import { KAKAO_REST_API_KEY, API_BASE_URL } from "@env";
import { Alert } from "react-native";

export const kakaoLoginForm = (onLoginSuccess: (token: string) => void) => {
  const startKakaoLogin = async () => {
    try {
      if (__DEV__) {
        console.log("[KAKAO] 로그인 시작");
        console.log("[KAKAO] API_BASE_URL =", API_BASE_URL);
      }

      const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
      const BACKEND_CALLBACK_URI = `${API_BASE_URL}/api/auth/kakao/callback`;
      const EXPO_REDIRECT_URI = "runboo://";

      const authUrl =
          `${KAKAO_AUTH_URL}?client_id=${KAKAO_REST_API_KEY}` +
          `&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URI)}` +
          `&response_type=code`;

      if (__DEV__) {
        console.log("[KAKAO] authUrl =", authUrl);
      }

      const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          EXPO_REDIRECT_URI
      );

      if (__DEV__) {
        console.log("[KAKAO] WebBrowser result =", result);
      }

      if (result.type !== "success" || !result.url) {
        if (__DEV__) {
          console.log("[KAKAO] 로그인 취소 또는 실패");
        }
        return;
      }

      const url = result.url;

      if (__DEV__) {
        console.log("[KAKAO] redirect url =", url);
      }

      const getParam = (key: string) =>
          url.match(new RegExp(`${key}=([^&]*)`))?.[1];

      const status = getParam("status");
      const code = getParam("code");
      const accessToken = getParam("accessToken");
      const refreshToken = getParam("refreshToken");

      if (__DEV__) {
        console.log("[KAKAO] parsed params =", {
          status,
          code,
          accessToken: accessToken ? "EXISTS" : "NONE",
          refreshToken: refreshToken ? "EXISTS" : "NONE",
        });
      }

      /* =========================
           ❌ 로그인 실패
         ========================= */
      if (status === "FAIL") {
        if (__DEV__) {
          console.log("[KAKAO] 로그인 실패 code =", code);
        }

        if (code === "LOCAL_ACCOUNT") {
          Alert.alert(
              "로그인 실패",
              "이 이메일은 로컬 로그인 계정입니다.\n이메일 로그인을 이용해 주세요."
          );
        } else if (code === "DEACTIVATED") {
          Alert.alert("로그인 실패", "탈퇴된 계정입니다.");
        } else {
          Alert.alert("로그인 실패", "카카오 로그인에 실패했습니다.");
        }
        return;
      }

      /* =========================
           ✅ 로그인 성공
         ========================= */
      if (!accessToken) {
        if (__DEV__) {
          console.error("[KAKAO] accessToken 없음");
        }
        Alert.alert("로그인 실패", "토큰을 받지 못했습니다.");
        return;
      }

      await AsyncStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      setAccessToken(accessToken);
      onLoginSuccess(accessToken);

      if (__DEV__) {
        console.log("[KAKAO] 로그인 성공");
      }
    } catch (e) {
      console.error("[KAKAO] 로그인 중 예외 발생", e);
      Alert.alert("로그인 실패", "카카오 로그인 중 오류가 발생했습니다.");
    }
  };

  return { startKakaoLogin };
};
