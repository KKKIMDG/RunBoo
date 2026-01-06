package com.runboo.domain.notification.controller;

import com.runboo.domain.notification.dto.NotificationResponseDto;
import com.runboo.domain.notification.service.NotificationReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationReadController {

    private final NotificationReadService readService;

    /**
     * 알림 단건 읽음 처리
     */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId
    ) {
        readService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    /**
     * 전체 읽음 처리
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        readService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}
