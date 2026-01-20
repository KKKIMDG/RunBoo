import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAccessToken } from "@/services/api";
import { GOOGLE_WEB_CLIENT_ID, API_BASE_URL } from "@env";
import { Alert } from "react-native";

export const googleLoginForm = (onLoginSuccess: (token: string) => void) => {
  const startGoogleLogin = async () => {
    try {
      if (__DEV__) {
        console.log("[GOOGLE] 로그인 시작");
        console.log("[GOOGLE] API_BASE_URL =", API_BASE_URL);
        console.log("[GOOGLE] CLIENT_ID =", GOOGLE_WEB_CLIENT_ID);
      }

      const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
      const BACKEND_CALLBACK_URI = `${API_BASE_URL}/api/auth/google/callback`;
      const EXPO_REDIRECT_URI = "runboo://";

      const authUrl =
          `${GOOGLE_AUTH_URL}?client_id=${GOOGLE_WEB_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(BACKEND_CALLBACK_URI)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent("email profile")}` +
          `&access_type=offline`;

      if (__DEV__) {
        console.log("[GOOGLE] authUrl =", authUrl);
      }

      const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          EXPO_REDIRECT_URI
      );

      if (__DEV__) {
        console.log("[GOOGLE] WebBrowser result =", result);
      }

      if (result.type !== "success" || !result.url) {
        if (__DEV__) {
          console.log("[GOOGLE] 로그인 취소 또는 실패");
        }
        return;
      }

      const url = result.url;

      if (__DEV__) {
        console.log("[GOOGLE] redirect url =", url);
      }

      const getParam = (key: string) =>
          url.match(new RegExp(`${key}=([^&]*)`))?.[1];

      const status = getParam("status");
      const code = getParam("code");
      const accessToken = getParam("accessToken");
      const refreshToken = getParam("refreshToken");

      if (__DEV__) {
        console.log("[GOOGLE] parsed params =", {
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
          console.log("[GOOGLE] 로그인 실패 code =", code);
        }

        if (code === "LOCAL_ACCOUNT") {
          Alert.alert(
              "로그인 실패",
              "이 이메일은 로컬 로그인 계정입니다.\n이메일 로그인을 이용해 주세요."
          );
        } else if (code === "DEACTIVATED") {
          Alert.alert("로그인 실패", "탈퇴된 계정입니다.");
        } else {
          Alert.alert("로그인 실패", "구글 로그인에 실패했습니다.");
        }
        return;
      }

      /* =========================
           ✅ 로그인 성공
         ========================= */
      if (!accessToken) {
        if (__DEV__) {
          console.error("[GOOGLE] accessToken 없음");
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
        console.log("[GOOGLE] 로그인 성공");
      }
    } catch (e) {
      console.error("[GOOGLE] 로그인 중 예외 발생", e);
      Alert.alert("로그인 실패", "구글 로그인 중 오류가 발생했습니다.");
    }
  };

  return { startGoogleLogin };
};
