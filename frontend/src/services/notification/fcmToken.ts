// services/notification/fcmToken.ts
import { Platform } from "react-native";

let messaging: any = null;

// ✅ Android에서만 @react-native-firebase/messaging 로드
if (Platform.OS === "android") {
  // require 사용 → iOS 빌드 시 모듈 로딩 자체를 막음
  messaging = require("@react-native-firebase/messaging").default;
}

export async function getFcmToken(): Promise<string> {
  // ✅ iOS에서는 아예 FCM 미사용
  if (Platform.OS !== "android") {
    console.log("[FCM] iOS - FCM disabled");
    return "";
  }

  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    throw new Error("FCM permission not granted");
  }

  const token = await messaging().getToken();

  if (!token) {
    throw new Error("Failed to get FCM token");
  }

  return token; // ✅ Android에서만 실제 FCM 토큰 반환
}
