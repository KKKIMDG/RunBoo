package com.runboo.domain.notification.controller;

import com.runboo.domain.notification.dto.NotificationPreferenceRequestDto;
import com.runboo.domain.notification.dto.NotificationPreferenceResponseDto;
import com.runboo.domain.notification.service.UserNotificationPreferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification/preferences")
public class UserNotificationPreferenceController {

    private final UserNotificationPreferenceService service;

    /**
     * 알림 설정 조회
     * GET /api/notification/preferences
     */
    @GetMapping
    public ResponseEntity<List<NotificationPreferenceResponseDto>> getMyPreferences() {
        return ResponseEntity.ok(service.getMyPreferences());
    }

    /**
     * 알림 설정 변경
     * POST /api/notification/preferences
     */
    @PostMapping
    public ResponseEntity<Void> savePreference(
            @Valid @RequestBody NotificationPreferenceRequestDto request
    ) {
        service.savePreference(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 배치 api 추가
     */
    @PostMapping("/batch")
    public ResponseEntity<Void> savePreferences(
            @Valid @RequestBody List<NotificationPreferenceRequestDto> requests
    ) {
        service.savePreferences(requests);
        return ResponseEntity.ok().build();
    }
}
