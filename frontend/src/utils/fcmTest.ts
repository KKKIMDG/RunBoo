import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * FCM 테스트용 토큰 출력 함수
 * - Android: FCM token
 * - iOS: APNs token (지금은 안 써도 됨)
 */
export async function printFcmTestToken() {
    // 1. 알림 권한 요청 (Android 13+ 필수)
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("❌ 알림 권한 거부됨");
        return;
    }

    // 2. Expo Push Token (참고용, 서버 테스트에 사용 ❌)
    const expoToken = await Notifications.getExpoPushTokenAsync();
    console.log("ℹ️ Expo Push Token:", expoToken.data);

    // 3. Device Push Token
    // 👉 Android에서는 이게 FCM 토큰
    const deviceToken = await Notifications.getDevicePushTokenAsync();

    console.log("✅ Device Push Token (FCM):", deviceToken.data);
    console.log("token type:", deviceToken.type, "platform:", Platform.OS);
}
