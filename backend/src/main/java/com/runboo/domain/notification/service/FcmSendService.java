package com.runboo.domain.notification.service;

import com.google.firebase.messaging.*;
import com.runboo.domain.notification.repository.UserPushDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FcmSendService {

    private final UserPushDeviceRepository userPushDeviceRepository;

    public void send(
            String token,
            String title,
            String body,
            Map<String, String> data
    ) {
        try {
            Message.Builder builder = Message.builder()
                    .setToken(token)
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )
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

            if (data != null) {
                data.forEach(builder::putData);
            }

            String messageId = FirebaseMessaging.getInstance().send(builder.build());
            log.info("FCM sent. messageId={}", messageId);

        } catch (FirebaseMessagingException e) {
            log.error("FCM send failed", e);

            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                userPushDeviceRepository
                        .findByToken(token)
                        .ifPresent(userPushDeviceRepository::delete);
            }
        }
    }

    public void sendReminder(String token) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(
                            Notification.builder()
                                    .setTitle("오늘 러닝 어떠세요?")
                                    .setBody("퇴실찍기!! 🏃")
                                    .build()
                    )
                    .putData("type", "REMINDER")
                    .build();

            FirebaseMessaging.getInstance().send(message);

        } catch (FirebaseMessagingException e) {
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                userPushDeviceRepository
                        .findByToken(token)
                        .ifPresent(userPushDeviceRepository::delete);
            }
        }
    }
}