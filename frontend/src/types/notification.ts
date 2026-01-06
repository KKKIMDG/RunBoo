export const NotificationType = {
    RUN_RESULT: 'RUN_RESULT',
    CHALLENGE: 'CHALLENGE',
    REMINDER: 'REMINDER',
    EVENT: 'EVENT',
} as const;

export type NotificationType =
    typeof NotificationType[keyof typeof NotificationType];