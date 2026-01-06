package com.runboo.domain.notification.controller;

import com.runboo.domain.notification.dto.NotificationResponseDto;
import com.runboo.domain.notification.service.NotificationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationQueryController {

    private final NotificationQueryService queryService;

    /**
     * 알림 전체
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications() {
        return ResponseEntity.ok(queryService.getMyNotifications());
    }

    /**
     * 미읽음 알림만
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDto>> getMyUnreadNotifications() {
        return ResponseEntity.ok(queryService.getMyUnreadNotifications());
    }

    /**
     * 미읽음 개수
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Long> countUnread() {
        return ResponseEntity.ok(queryService.countMyUnread());
    }
}
