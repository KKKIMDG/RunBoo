// src/services/notification/notificationPreferenceService.ts
import { api } from '@/services/api';
import type { NotificationType } from '@/types/notification';
import type { NotificationPreferenceItem } from '@/types/notificationPreference';

/**
 * 내 알림 설정 조회
 * GET /api/notification/preferences
 */
async function getMyPreferences(): Promise<NotificationPreferenceItem[]> {
    return api.get('/api/notification/preferences');
}

/**
 * 알림 설정 변경
 * POST /api/notification/preferences
 */
async function updatePreference(params: {
    type: NotificationType;
    enabled: boolean;
}): Promise<void> {
    await api.post('/api/notification/preferences', params);
}

export const notificationPreferenceService = {
    getMyPreferences,
    updatePreference,
};
