package com.runboo.domain.notification.scheduler;

import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.service.NotificationCreateService;
import com.runboo.domain.notification.service.UserNotificationPreferenceService;
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
    private final UserRepository userRepository;
    private final NotificationCreateService notificationCreateService;
    /**
     * 리마인더 발송
     */
    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void sendDailyReminder() {

        List<Long> userIds = userRepository.findAllActiveUserIds();

        for (Long userId : userIds) {

            // 1️⃣ 리마인더 설정 확인
            if (!preferenceService.isEnabled(userId, NotificationType.REMINDER)) {
                continue;
            }

            // 2️⃣ DB 알림 저장 + FCM 전송 (서비스에 위임)
            notificationCreateService.create(
                    userId,
                    NotificationType.REMINDER,
                    "오늘 러닝 어떠세요?",
                    "테스트용 알림입니다. 1분마다 뜨니까. 끄고 싶으면 설정에서 리마인더 알림 끄세요🏃",
                    true
            );
        }
    }

}
