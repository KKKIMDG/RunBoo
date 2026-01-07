package com.runboo.domain.notification.scheduler;

import com.runboo.domain.notification.entity.UserPushDevice;
import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.service.FcmSendService;
import com.runboo.domain.notification.service.UserNotificationPreferenceService;
import com.runboo.domain.notification.service.UserPushDeviceService;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReminderNotificationScheduler {

    private final UserNotificationPreferenceService preferenceService;
    private final UserPushDeviceService pushDeviceService;
    private final FcmSendService fcmSendService;
    private final UserRepository userRepository;

    /**
     * 매일 19:00 (한국 시간) 리마인더 발송
     */
    @Scheduled(cron = "0 0 19 * * *", zone = "Asia/Seoul")
    public void sendDailyReminder() {

        // ✅ 스케줄러에서는 반드시 "조회"로 userId를 가져온다
        List<Long> userIds = userRepository.findAllActiveUserIds();

        for (Long userId : userIds) {

            // 1️⃣ 리마인더 설정 확인
            if (!preferenceService.isEnabled(userId, NotificationType.REMINDER)) {
                continue;
            }

            // 2️⃣ 활성 디바이스 조회
            List<UserPushDevice> devices =
                    pushDeviceService.getEnabledDevices(userId);

            // 3️⃣ FCM 발송
            for (UserPushDevice device : devices) {
                fcmSendService.sendReminder(device.getToken());
            }
        }
    }
}
