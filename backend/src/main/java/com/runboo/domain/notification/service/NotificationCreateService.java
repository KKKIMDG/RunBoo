package com.runboo.domain.notification.service;

import com.runboo.domain.notification.entity.Notification;
import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.repository.NotificationRepository;
import com.runboo.domain.notification.repository.UserNotificationPreferenceRepository;
import com.runboo.domain.notification.repository.UserPushDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationCreateService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final UserPushDeviceRepository userPushDeviceRepository;
    private final FcmSendService fcmSendService;

    /**
     * 알림 생성 (로그 저장 전용)
     *
     * @param userId        대상 유저
     * @param type          알림 타입
     * @param title         알림 제목
     * @param body          알림 본문
     * @param pushEnabled   유저 전체 푸시 ON/OFF
     */
    @Transactional
    public void create(
            Long userId,
            NotificationType type,
            String title,
            String body,
            boolean pushEnabled
    ) {
        // 1️⃣ 전체 푸시 OFF → 즉시 종료
        if (!pushEnabled) {
            return;
        }

        // 2️⃣ 타입별 알림 수신 여부 판단
        boolean enabled = preferenceRepository
                .findByUserIdAndType(userId, type)
                .map(p -> p.isEnabled())
                .orElseGet(() -> getDefault(type));

        if (!enabled) {
            return;
        }

        // 3️⃣ 알림 로그 저장
        Notification notification = Notification.create(
                userId,
                type,
                title,
                body
        );

        notificationRepository.save(notification);

        // 2️⃣ FCM 전송
        userPushDeviceRepository
                .findAllByUserIdAndEnabledTrue(userId)
                .forEach(device ->
                        fcmSendService.send(
                                device.getToken(),
                                title,
                                body,
                                null
                        )
                );
    }

    /**
     * 알림 타입 기본값
     * row 없을 때만 사용
     */
    private boolean getDefault(NotificationType type) {
        return switch (type) {
            case RUN_RESULT, CHALLENGE -> true;
            case REMINDER, EVENT -> false;
        };
    }
}
