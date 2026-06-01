// services/notification/fcmToken.ts
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

/** APNs 토큰이 준비될 때까지 짧게 폴링 (iOS 첫 실행 시 지연 대비) */
async function waitForApnsToken(retries = 5, delayMs = 600): Promise<void> {
  for (let i = 0; i < retries; i++) {
    const apnsToken = await messaging().getAPNSToken();
    if (apnsToken) return;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  // 끝까지 못 받아도 getToken을 시도한다 (네트워크/APNs 상황에 따라 이후 성공 가능)
}

export async function getFcmToken(): Promise<string> {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    throw new Error("FCM permission not granted");
  }

  // iOS는 FCM 토큰 발급 전에 APNs 등록 + APNs 토큰 수신이 선행돼야 한다.
  if (Platform.OS === "ios") {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    await waitForApnsToken();
  }

  const token = await messaging().getToken();

  if (!token) {
    throw new Error("Failed to get FCM token");
  }

  return token; // ✅ 서버로 보내야 하는 진짜 FCM 토큰
}
