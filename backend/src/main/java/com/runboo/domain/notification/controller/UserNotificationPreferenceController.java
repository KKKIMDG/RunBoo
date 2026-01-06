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
@RequestMapping("/api/users/me")
public class UserNotificationPreferenceController {

    private final UserNotificationPreferenceService service;

    @GetMapping("/settings")
    public ResponseEntity<List<NotificationPreferenceResponseDto>> getMySettings() {
        return ResponseEntity.ok(service.getMyPreferences());
    }

    @PostMapping("/notification-preferences")
    public ResponseEntity<Void> savePreference(
            @Valid @RequestBody NotificationPreferenceRequestDto request
    ) {
        service.savePreference(request);
        return ResponseEntity.ok().build();
    }
}
