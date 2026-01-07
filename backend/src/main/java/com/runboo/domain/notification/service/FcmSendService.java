package com.runboo.domain.notification.service;

import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class FcmSendService {

    /**
     * 단일 토큰으로 FCM 전송
     */
    public void send(
            String token,
            String title,
            String body,
            Map<String, String> data
    ) {
        try {
            Message.Builder builder = Message.builder()
                    .setToken(token)

                    // ✅ OS 알림 UI용
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )

                    // ✅ Android 전용 설정 (중요)
                    .setAndroidConfig(
                            AndroidConfig.builder()
                                    .setPriority(AndroidConfig.Priority.HIGH)
                                    .setNotification(
                                            AndroidNotification.builder()
                                                    .setChannelId("default")
                                                    .build()
                                    )
                                    .build()
                    );

            // ✅ 앱에서 사용하는 data payload
            if (data != null) {
                data.forEach(builder::putData);
            }

            String messageId = FirebaseMessaging.getInstance().send(builder.build());
            log.info("FCM sent. messageId={}", messageId);

        } catch (Exception e) {
            log.error("FCM send failed", e);
        }
    }
}
