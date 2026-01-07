export const NotificationType = {
    RUN_RESULT: 'RUN_RESULT',
    CHALLENGE: 'CHALLENGE',
    REMINDER: 'REMINDER',
    EVENT: 'EVENT',
} as const;

export type NotificationType =
    typeof NotificationType[keyof typeof NotificationType];

/**
 * 알림 아이템 (API 응답 단위)
 */
export type NotificationItem = {
    id: number;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
    type: NotificationType;
};