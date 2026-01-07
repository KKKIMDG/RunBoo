package com.runboo.domain.notification.service;

import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.entity.UserPushDevice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationSendFacade {

    private final UserNotificationPreferenceService preferenceService;
    private final UserPushDeviceService userPushDeviceService;
    private final FcmSendService fcmSendService;

    /**
     * 알림 발송 진입점
     *
     * 책임:
     * - 유저 알림 수신 설정 확인
     * - 활성 디바이스 조회
     * - 디바이스별 FCM 전송 위임
     *
     * 주의:
     * - DB 직접 접근 금지
     * - FCM 직접 로직 금지
     * - 조건 판단은 여기서만 수행
     */
    public void send(
            Long userId,
            NotificationType type,
            String title,
            String body
    ) {
        // 유저가 해당 알림 타입을 꺼두었으면 중단
        if (!preferenceService.isEnabled(userId, type)) {
            return;
        }

        // 알림을 받을 수 있는 활성 디바이스 조회
        List<UserPushDevice> devices =
                userPushDeviceService.getEnabledDevices(userId);

        // 활성 디바이스가 없으면 전송하지 않음
        for (UserPushDevice device : devices) {
            // 디바이스 단위로 FCM 전송
            fcmSendService.send(
                    device.getToken(),
                    title,
                    body,
                    // 앱 내부 라우팅/분기용 데이터
                    Map.of("type", type.name())
            );
        }
    }
}
