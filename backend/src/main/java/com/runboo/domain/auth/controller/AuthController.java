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

    /**
     * 이메일 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> emailLogin(
            @Valid @RequestBody LocalLoginRequestDto request
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
            @Valid @RequestBody SocialLoginRequestDto request
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
            @Valid @RequestBody EmailVerifyRequestDto request
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
            @Valid @RequestBody EmailVerifyCheckRequestDto request
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
            @Valid @RequestBody LocalSignupRequestDto request
    ) {
        authService.signupLocal(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 토큰 재발급(자동로그인)
     * refresh 토큰
     * POST /api/auth/token/reissue
     */
    @PostMapping("/token/reissue")
    public ResponseEntity<TokenReissueResponse> reissue(
            @RequestHeader("Authorization") String authorization
    ){
        String refreshToken = authorization.replace("Bearer ", "");
        String newAccessToken = authService.reissueAccessToken(refreshToken);

        return ResponseEntity.ok(
                new TokenReissueResponse(newAccessToken)
        );
    }
}
