package com.runboo.domain.badge.controller;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.badge.service.UserBadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-badges")
@RequiredArgsConstructor
public class UserBadgeController {

    private final UserBadgeService userBadgeService;

    /**
     * 특정 유저가 획득한 뱃지 목록 조회
     * GET http://localhost:8080/api/user-badges/1
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<BadgeDto>> getUserBadges(@PathVariable Long userId) {
        List<BadgeDto> badges = userBadgeService.getUserBadges(userId);

        // 200 OK 상태코드와 함께 뱃지 리스트를 반환합니다.
        return ResponseEntity.ok(badges);
    }
}