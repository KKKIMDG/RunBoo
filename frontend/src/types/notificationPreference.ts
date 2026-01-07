import type { NotificationType } from '@/types/notification';

export type NotificationPreferenceItem = {
    type: NotificationType;
    enabled: boolean;
};

export type NotificationPreference = Record<NotificationType, boolean>;
