package com.runboo.domain.notification.scheduler;

import com.runboo.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupScheduler {

    private final NotificationRepository notificationRepository;

    /**
     * 알림 정리
     * - 30일 지난 알림 hard delete
     * - 매일 새벽 3시 실행 (KST)
     */
    @Transactional
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    public void cleanupOldNotifications() {
        LocalDateTime threshold =
                LocalDateTime.now(ZoneId.of("Asia/Seoul")).minusDays(30);

        int deleted = notificationRepository.deleteOlderThan(threshold);

        log.info("[NotificationCleanup] deleted {} notifications", deleted);
    }
}
