import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import FlashMessage from "react-native-flash-message";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

// 서비스 및 인증
import { setAccessToken } from "@/services/api";
import { AuthService } from "@/services/auth/authService";
import { authEventBus } from "@/services/auth/authEvents";
import {
  disablePushDevice,
  registerPushDevice,
} from "@/services/notification/notificationService";
import { getFcmToken } from "@/services/notification/fcmToken";

// 컨텍스트 및 컴포넌트
import { UserMeProvider } from "@/contexts/UserMeContext";
import { UserSettingProvider } from "@/contexts/UserSettingContext";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";
import PermissionGuard from "@/components/auth/PermissionGuard";
import RootNavigator from "./navigation/root/RootNavigator";
import OnboardingScreen from "@/screens/tutorial/OnboardingScreen";
import { NotificationHandler } from "@/components/NotificationHandler";

// 훅
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { useSettings } from "@/screens/Settings/useSettings";
import { useTutorial } from "@/hooks/useTutorial";

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const silentLogout = async () => {
    await AuthService.logout();
    setIsLoggedIn(false);
  };

  /** 로그아웃 시 FCM 비활성화 포함 */
  const handleLogout = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const fcmToken = await AsyncStorage.getItem("fcmToken");
      if (accessToken && fcmToken) {
        await disablePushDevice(fcmToken);
      }
    } catch (e) {
      console.warn("FCM disable failed", e);
    }
    await AuthService.logout();
    setIsLoggedIn(false);
  };

  /** 초기 부트스트랩 (폰트 + FCM 등록) */
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Font.loadAsync({
          BMJUA: require("@/assets/fonts/BMJUA_ttf.ttf"),
          GmarketSansBold: require("@/assets/fonts/GmarketSansTTFBold.ttf"),
          Chab: require("@/assets/fonts/chab.ttf"),
          KERISKEDU_B: require("@/assets/fonts/KERISKEDU_B.ttf"),
          "SUITE-Heavy": require("@/assets/fonts/SUITE-Heavy.ttf"),
        });

        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          setAccessToken(token);
          setIsLoggedIn(true);

          if (Platform.OS !== "ios") {
            try {
              const fcmToken = await getFcmToken();
              await AsyncStorage.setItem("fcmToken", fcmToken);
              await registerPushDevice({ token: fcmToken, platform: "ANDROID" });
            } catch (e) {
              console.warn("FCM register failed", e);
            }
          }
        }
      } catch (e) {
        console.warn("App bootstrap failed", e);
        await silentLogout();
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const unsubscribe = authEventBus.subscribeLogout(() => handleLogout());
    return unsubscribe;
  }, []);

  /** 로그인 성공 시 FCM 등록 */
  const handleLoginSuccess = async (token: string) => {
    setAccessToken(token);
    setIsLoggedIn(true);
    authEventBus.emitLogin();

    if (Platform.OS !== "ios") {
      try {
        const fcmToken = await getFcmToken();
        await AsyncStorage.setItem("fcmToken", fcmToken);
        await registerPushDevice({ token: fcmToken, platform: "ANDROID" });
      } catch (e) {
        console.warn("FCM register after login failed", e);
      }
    }
  };

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: "#000000" }} />;
  }

  return (
      <SafeAreaProvider>
        <TutorialProvider>
          {/* UserSettingProvider를 위로 올려 로그인 전 AppInner에서도 useSettings를 쓸 수 있게 함 */}
          <UserSettingProvider>
            {isLoggedIn ? (
                <UserMeProvider>
                  <AppInner
                      isLoggedIn={true}
                      onLoginSuccess={handleLoginSuccess}
                      onLogout={handleLogout}
                  />
                </UserMeProvider>
            ) : (
                <AppInner
                    isLoggedIn={false}
                    onLoginSuccess={handleLoginSuccess}
                    onLogout={handleLogout}
                />
            )}
          </UserSettingProvider>
        </TutorialProvider>
        <FlashMessage position="top" />
      </SafeAreaProvider>
  );
}

function AndroidSafeAreaRoot({ children, resolvedTheme }: { children: React.ReactNode; resolvedTheme: "light" | "dark" }) {
  if (Platform.OS !== 'android') return <>{children}</>;
  return (
      <View style={{ flex: 1, backgroundColor: resolvedTheme === "dark" ? "#000000" : "#ffffff"}}>
        {children}
      </View>
  );
}

function AppInner({ isLoggedIn, onLoginSuccess, onLogout }: { isLoggedIn: boolean; onLoginSuccess: (token: string) => void; onLogout: () => void; }) {

  const { hasSeenOnboarding } = useTutorial();
  const { settings } = useSettings();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setButtonStyleAsync(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme]);

  // [1] 비로그인 상태
  if (!isLoggedIn) {
    return (
        <>
          <StatusBar style="dark" backgroundColor="#ffffff" />
          <NavigationContainer theme={DefaultTheme}>
            <PermissionGuard>
              <RootNavigator isLoggedIn={false} onLoginSuccess={onLoginSuccess} onLogout={onLogout} />
            </PermissionGuard>
          </NavigationContainer>
        </>
    );
  }

  // [2] 로그인 됨 + 튜토리얼 안 봄
  if (!hasSeenOnboarding) {
    return (
        <>
          <StatusBar style="light" backgroundColor="#000000" />
          <OnboardingScreen onComplete={() => {}} />
        </>
    );
  }

  // [3] 로그인 됨 +  봄 (메인 앱)
  return (
      <>
        <StatusBar
            style={resolvedTheme === "dark" ? "light" : "dark"}
            backgroundColor={resolvedTheme === "dark" ? "#000000" : "#ffffff"}
        />
        <AndroidSafeAreaRoot resolvedTheme={resolvedTheme}>
          <NavigationContainer theme={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
            <NotificationHandler />
            <PermissionGuard>
              <RootNavigator isLoggedIn={isLoggedIn} onLoginSuccess={onLoginSuccess} onLogout={onLogout} />
            </PermissionGuard>
          </NavigationContainer>
        </AndroidSafeAreaRoot>
      </>
  );
}