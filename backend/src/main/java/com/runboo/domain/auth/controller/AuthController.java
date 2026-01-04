package com.runboo.domain.auth.controller;

import com.runboo.domain.auth.dto.*;
import com.runboo.domain.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /* =====================
       로그인 / 회원가입
       ===================== */

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> emailLogin(
            @Valid @RequestBody LocalLoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.loginByEmail(request));
    }

    @PostMapping("/login/oauth")
    public ResponseEntity<LoginResponseDto> socialLogin(
            @Valid @RequestBody SocialLoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.loginBySocial(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signupLocal(
            @Valid @RequestBody LocalSignupRequestDto request
    ) {
        authService.signupLocal(request);
        return ResponseEntity.ok().build();
    }

    /* =====================
       이메일 인증
       ===================== */

    @PostMapping("/email/verify")
    public ResponseEntity<Void> sendEmailVerifyCode(
            @Valid @RequestBody EmailVerifyRequestDto request
    ) {
        authService.sendEmailVerifyCode(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email/verify/check")
    public ResponseEntity<Void> checkEmailVerifyCode(
            @Valid @RequestBody EmailVerifyCheckRequestDto request
    ) {
        authService.verifyEmailCode(request);
        return ResponseEntity.ok().build();
    }

    /* =====================
       토큰 재발급
       ===================== */

    @PostMapping("/token/reissue")
    public ResponseEntity<TokenReissueResponse> reissue(
            @RequestHeader("Authorization") String authorization
    ) {
        String refreshToken = authorization.replace("Bearer ", "");
        String newAccessToken = authService.reissueAccessToken(refreshToken);
        return ResponseEntity.ok(new TokenReissueResponse(newAccessToken));
    }

    /* =====================
       비밀번호 재설정
       ===================== */

    // 1단계: 이메일로 인증 코드 발송
    @PostMapping("/password/reset-request")
    public ResponseEntity<Void> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDto request
    ) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    // 2단계: 인증 코드 검증 → resetToken 발급
    @PostMapping("/password/verify")
    public ResponseEntity<PasswordResetVerifyResponseDto> verifyPasswordResetCode(
            @Valid @RequestBody PasswordResetVerifyRequestDto request
    ) {
        return ResponseEntity.ok(
                authService.verifyPasswordResetCode(request)
        );
    }

    // 3단계: resetToken으로 새 비밀번호 설정 (최종)
    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody PasswordResetChangeRequestDto request
    ) {
        String resetToken = authorization.replace("Bearer ", "");
        authService.resetPassword(resetToken, request);
        return ResponseEntity.ok().build();
    }
}
