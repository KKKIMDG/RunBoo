package com.runboo.domain.usersetting.controller;

import com.runboo.domain.usersetting.dto.UserSettingResponse;
import com.runboo.domain.usersetting.dto.UserSettingUpdateRequest;
import com.runboo.domain.usersetting.service.UserSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class UserSettingController {

    private final UserSettingService userSettingService;

    /**
     * 설정 조회
     * GET /api/settings
     */
    @GetMapping
    public ResponseEntity<UserSettingResponse> getSettings() {
        return ResponseEntity.ok(userSettingService.getSettings());
    }

    /**
     * 설정 변경 (부분 수정)
     * PATCH /api/settings
     */
    @PatchMapping
    public ResponseEntity<Void> updateSettings(
            @RequestBody @Valid UserSettingUpdateRequest request
    ) {
        userSettingService.updateSettings(request);
        return ResponseEntity.noContent().build();
    }
}
