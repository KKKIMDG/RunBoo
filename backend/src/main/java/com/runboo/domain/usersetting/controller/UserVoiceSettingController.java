package com.runboo.domain.usersetting.controller;

import com.runboo.domain.usersetting.dto.UserVoiceSettingResponse;
import com.runboo.domain.usersetting.service.UserSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/voice-settings")
@RequiredArgsConstructor
public class UserVoiceSettingController {

    private final UserSettingService userSettingService;

    /**
     * 음성 안내 설정 조회
     * GET /api/users/voice-settings
     */
    @GetMapping
    public ResponseEntity<UserVoiceSettingResponse> getVoiceSettings() {
        return ResponseEntity.ok(userSettingService.getVoiceSettings());
    }
}
