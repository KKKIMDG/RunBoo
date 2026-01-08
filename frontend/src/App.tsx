import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import RootNavigator from "./navigation/root/RootNavigator";
import { setAccessToken } from "@/services/api";
import { Platform, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "@/services/auth/authService";
import { authEventBus } from "@/services/auth/authEvents";
import { UserMeProvider } from "@/contexts/UserMeContext";
import { UserSettingProvider } from "@/contexts/UserSettingContext";
import {
  disablePushDevice,
  registerPushDevice,
} from "@/services/notification/notificationService";
import { getFcmToken } from "@/services/notification/fcmToken";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      const fcmToken = await AsyncStorage.getItem("fcmToken");

      if (fcmToken) {
        await disablePushDevice(fcmToken);
      }
    } catch (e) {
      // 실패해도 로그아웃은 진행
      console.warn("FCM disable failed", e);
    }
    setIsLoggedIn(false); // 화면 전환 트리거
    await AuthService.logout(); // access/refresh 제거
  };

  useEffect(() => {
    const restoreLogin = async () => {
      const token = await AsyncStorage.getItem("accessToken");

      if (token) {
        setAccessToken(token);
        setIsLoggedIn(true);
        // ❗ 실제 인증은 API 호출 시 검증됨

        // 🔹 FCM touch
        if (Platform.OS !== "ios") {
          try {
            const fcmToken = await getFcmToken();
            await AsyncStorage.setItem("fcmToken", fcmToken);

            await registerPushDevice({
              token: fcmToken,
              platform: "ANDROID",
            });
          } catch (e) {
            console.warn("FCM touch failed", e);
          }
        } else {
          console.log("[FCM] iOS - skip register (no Apple Dev account)");
        }
      }

      setLoading(false);
    };

    restoreLogin();
  }, []);

  //전역 자동 로그아웃
  useEffect(() => {
    const unsubscribe = authEventBus.subscribeLogout(() => {
      handleLogout();
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (token: string) => {
    setAccessToken(token);
    setIsLoggedIn(true);
    authEventBus.emitLogin();
  };

  if (loading) {
    return null;
  }

  const MyTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      primary: Colors[colorScheme === "dark" ? "dark" : "light"].primary,
      background: Colors[colorScheme === "dark" ? "dark" : "light"].background,
      card: Colors[colorScheme === "dark" ? "dark" : "light"].card,
      text: Colors[colorScheme === "dark" ? "dark" : "light"].text,
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <UserSettingProvider>
        <UserMeProvider>
          <RootNavigator
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        </UserMeProvider>
      </UserSettingProvider>
    </NavigationContainer>
  );
}
