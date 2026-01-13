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
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderNotificationScheduler {

    private final UserNotificationPreferenceService preferenceService;
    private final UserPushDeviceService pushDeviceService;
    private final FcmSendService fcmSendService;
    private final UserRepository userRepository;

    /**
     * 리마인더 발송
     */
    @Scheduled(cron = "0 50 17 * * *", zone = "Asia/Seoul")
    public void sendDailyReminder() {

        // 스케줄러에서는 반드시 "조회"로 userId를 가져온다
        List<Long> userIds = userRepository.findAllActiveUserIds();
//        log.info("[REMINDER] userIds size={}", userIds.size());
        for (Long userId : userIds) {

            // ⃣ 리마인더 설정 확인
            if (!preferenceService.isEnabled(userId, NotificationType.REMINDER)) {
                continue;
            }

            // ⃣ 활성 디바이스 조회
            List<UserPushDevice> devices =
                    pushDeviceService.getEnabledDevices(userId);

//            log.info("[REMINDER] userId={} devices size={}", userId, devices.size());
            // FCM 발송
            for (UserPushDevice device : devices) {
                fcmSendService.sendReminder(device.getToken());
//                log.info("[FCM] send reminder token={}", device.getToken());
            }

        }
    }
}
