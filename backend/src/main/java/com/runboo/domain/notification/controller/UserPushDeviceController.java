package com.runboo.domain.notification.controller;

import com.runboo.domain.notification.dto.RegisterPushDeviceRequestDto;
import com.runboo.domain.notification.service.UserPushDeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification/devices")
public class UserPushDeviceController {

    private final UserPushDeviceService service;

    /**
     * FCM 디바이스(토큰) 등록 / 갱신
     *
     * 호출 시점:
     * - 로그인 직후
     * - 앱 실행 시
     *
     * 역할:
     * - 디바이스 토큰을 서버에 등록
     * - 기존 토큰이 있으면 활성화 및 lastSeen 갱신
     */
    @PostMapping
    public ResponseEntity<Void> register(
            @Valid @RequestBody RegisterPushDeviceRequestDto request
    ) {
        service.register(request);
        return ResponseEntity.ok().build();
    }

    /**
     * FCM 디바이스 비활성화
     *
     * 호출 시점:
     * - 로그아웃
     * - 앱 알림 권한 해제
     *
     * 의미:
     * - 디바이스 정보는 유지
     * - 이후 알림 발송 대상에서 제외
     */
    @PatchMapping("/{token}/disable")
    public ResponseEntity<Void> disable(
            @PathVariable String token
    ) {
        service.disableByToken(token);
        return ResponseEntity.ok().build();
    }
}
