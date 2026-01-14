package com.runboo.domain.user.controller;

import com.runboo.domain.user.dto.*;
import com.runboo.domain.user.service.UserService;
import com.runboo.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 내 정보 조회
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserMeResponseDto> getMyInfo() {
        return ResponseEntity.ok(userService.getMyInfo());
    }

    /**
     * 내 닉네임 수정
     * PATCH /api/users/me/nickname
     */
    @PatchMapping("/me/nickname")
    public ResponseEntity<Void> updateNickname(
            @RequestBody @Valid NicknameUpdateRequest request
    ) {
        userService.updateMyNickname(request.getNickname());
        return ResponseEntity.ok().build();
    }

    /**
     * 내 프로필 사진 수정
     * PATCH /api/users/me/profile-image
     */
    @PatchMapping("/me/profile-image")
    public ResponseEntity<Void> updateProfileImage(
            @RequestBody @Valid ProfileImgUpdateRequest request
    ) {
        userService.updateMyProfileImage(request.getProfileImageUrl());
        return ResponseEntity.ok().build();
    }

    /**
     * 현재 비밀번호 검증
     * POST /api/users/me/password/verify
     */
    @PostMapping("/me/password/verify")
    public ResponseEntity<Void> verifyCurrentPassword(
            @Valid @RequestBody PasswordVerifyRequestDto request
    ) {
        userService.verifyCurrentPassword(request.currentPassword());
        return ResponseEntity.ok().build();
    }

    /**
     * 비밀번호 변경
     * PUT /api/users/me/password
     */
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody PasswordChangeRequestDto request
    ) {
        userService.changePassword(request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    /**
     * 계정 탈퇴
     * POST /api/users/me/withdraw
     */
    @PostMapping("/me/withdraw")
    public ResponseEntity<Void> withdraw(
            @RequestBody(required = false) WithdrawRequest req
    ) {
        System.out.println("UserController.withdraw 실행!");
        userService.withdraw(req);
        return ResponseEntity.noContent().build();
    }
    /**
     * 블라인드 모드 변경 (ON/OFF)
     * PATCH /api/users/me/blind
     */
    @PatchMapping("/me/blind")
    public ResponseEntity<Void> changeBlindStatus(
            @RequestBody UserBlindRequestDto request
    ) {
        // 서비스에 요청: "내 아이디의 블라인드 상태를 이걸로 바꿔줘"
        userService.updateBlindStatus(request.isBlind());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String keyword,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(userService.searchUsers(keyword, user.getUserId()));
    }
}
