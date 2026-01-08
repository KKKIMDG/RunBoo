// services/notification/fcmToken.ts
import messaging from '@react-native-firebase/messaging';

export async function getFcmToken(): Promise<string> {
    const authStatus = await messaging().requestPermission();

    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
        throw new Error('FCM permission not granted');
    }

    const token = await messaging().getToken();

    if (!token) {
        throw new Error('Failed to get FCM token');
    }

    return token; // ✅ 서버로 보내야 하는 진짜 FCM 토큰
}
