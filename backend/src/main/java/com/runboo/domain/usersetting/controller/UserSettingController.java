package com.runboo.domain.usersetting.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/settings")
@RequiredArgsConstructor
public class UserSettingController {

//    private final UserSettingService userSettingService;
//
//    /**
//     * 설정 조회
//     * GET /api/users/me/settings
//     */
//    @GetMapping
//    public ResponseEntity<UserSettingResponseDto> getSettings() {
//        UserSettingResponseDto response = userSettingService.getSettings();
//        return ResponseEntity.ok(response);
//    }
//
//    /**
//     * 설정 변경
//     * PUT /api/users/me/settings
//     */
//    @PutMapping
//    public ResponseEntity<Void> updateSettings(
//            @RequestBody UserSettingUpdateRequestDto request
//    ) {
//        userSettingService.updateSettings(request);
//        return ResponseEntity.ok().build();
//    }
}
