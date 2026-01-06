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
