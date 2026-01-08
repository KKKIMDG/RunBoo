package com.runboo.domain.notification.service;

import com.runboo.domain.notification.entity.UserPushDevice;
import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.repository.UserPushDeviceRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderNotificationService {

    private final UserPushDeviceRepository userPushDeviceRepository;
    private final UserNotificationPreferenceService preferenceService;
    private final FcmSendService fcmSendService;

    /**
     * 시연용 리마인더 알림 전송
     * - 현재 로그인한 사용자 기준
     * - 알림 설정 (REMINDER) ON 인 경우만 발송
     */
    public void sendReminderForCurrentUser() {
        Long userId = SecurityUtil.getCurrentUserId();

        // ✅ 알림 타입별 설정 판단
        if (!preferenceService.isEnabled(userId, NotificationType.REMINDER)) {
            return;
        }

        // 사용자 디바이스 조회
        List<UserPushDevice> devices =
                userPushDeviceRepository.findAllByUserIdAndEnabledTrue(userId);

        // FCM 전송
        for (UserPushDevice device : devices) {
            fcmSendService.sendReminder(device.getToken());
        }
    }
}
