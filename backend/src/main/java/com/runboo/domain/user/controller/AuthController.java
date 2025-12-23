package com.runboo.domain.user.controller;

import com.runboo.domain.user.dto.*;
import com.runboo.domain.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 이메일 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> emailLogin(
            @RequestBody LocalLoginRequestDto request
    ) {
        LoginResponseDto response = authService.loginByEmail(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 소셜 로그인
     * POST /api/auth/login/oauth
     */
    @PostMapping("/login/oauth")
    public ResponseEntity<LoginResponseDto> socialLogin(
            @RequestBody SocialLoginRequestDto request
    ) {
        LoginResponseDto response = authService.loginBySocial(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 인증 코드 발송
     * POST /api/auth/email/verify
     */
    @PostMapping("/email/verify")
    public ResponseEntity<Void> sendEmailVerifyCode(
            @RequestBody EmailVerifyRequestDto request
    ) {
        authService.sendEmailVerifyCode(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 이메일 인증 코드 검증
     * POST /api/auth/email/verify/check
     */
    @PostMapping("/email/verify/check")
    public ResponseEntity<Void> checkEmailVerifyCode(
            @RequestBody EmailVerifyCheckRequestDto request
    ) {
        authService.verifyEmailCode(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 회원가입
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<Void> signupLocal(
            @RequestBody LocalSignupRequestDto request
    ) {
        authService.signupLocal(request);
        return ResponseEntity.ok().build();
    }

}
