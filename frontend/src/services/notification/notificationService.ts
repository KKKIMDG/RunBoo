// src/services/notification/notificationService.ts
import { api } from "@/services/api";
import type { NotificationItem } from "@/types/notification";

/** 전체 알림 */
export const getNotifications = async (): Promise<NotificationItem[]> => {
    return api.get("/api/notification");
};

/** 미읽음 알림 */
export const getUnreadNotifications = async (): Promise<NotificationItem[]> => {
    return api.get("/api/notification/unread");
};

/** 미읽음 개수 */
export const getUnreadCount = async (): Promise<number> => {
    return api.get("/api/notification/unread/count");
};

/** 단건 읽음 */
export const readNotification = async (id: number): Promise<void> => {
    await api.patch(`/api/notification/${id}/read`, null);
};

/** 모두 읽음 */
export const readAllNotifications = async (): Promise<void> => {
    await api.patch("/api/notification/read-all", null);
};

export interface RegisterPushDeviceRequest {
    token: string;
    platform: 'ANDROID' | 'IOS';
}

/**
 * FCM 디바이스 등록 / 갱신
 * - 로그인 성공 직후
 * - 앱 실행 시 (touch)
 */
export async function registerPushDevice(
    data: RegisterPushDeviceRequest
): Promise<void> {
    await api.post('/api/notification/devices', data);
}

/**
 * FCM 디바이스 비활성화
 * - 로그아웃
 * - 알림 권한 해제
 */
export async function disablePushDevice(token: string): Promise<void> {
    await api.patch(`/api/notification/devices/${token}/disable`, null);
}