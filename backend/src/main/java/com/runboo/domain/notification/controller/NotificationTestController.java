package com.runboo.domain.notification.controller;

import com.runboo.domain.notification.service.ReminderNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationTestController {

    private final ReminderNotificationService reminderNotificationService;

    /**
     * 시연용 리마인더 알림 트리거
     *
     * - 앱 백그라운드 상태에서 호출하면
     *   시스템 푸시 알림이 표시된다
     */
    @PostMapping("/test/reminder")
    public ResponseEntity<Void> sendReminderTest() {
        reminderNotificationService.sendReminderForCurrentUser();
        return ResponseEntity.ok().build();
    }
}
