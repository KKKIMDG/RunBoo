package com.runboo.domain.auth.controller;

import com.runboo.domain.auth.dto.*;
import com.runboo.domain.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 앱 딥링크 또는 웹 redirect 대상
     * - ex) runboo://login
     */
    @Value("${app.frontend.url}")
    private String frontendUrl;

    /* =====================
       로그인
       ===================== */

    /**
     * 로컬(이메일) 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> emailLogin(
            @Valid @RequestBody LocalLoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.loginByEmail(request));
    }

    /* =====================
       소셜 로그인 (OAuth Callback)
       ===================== */

    /**
     * 카카오 OAuth 콜백
     *
     * 처리 원칙
     * - 성공 / 실패 모두 redirect
     * - 예외 throw X (OAuth 흐름 끊기지 않도록)
     * - 결과는 query parameter로 앱에 전달
     */
    @GetMapping("/kakao/callback")
    public void kakaoCallback(
            @RequestParam String code,
            HttpServletResponse response
    ) throws IOException {

        SocialLoginResult result =
                authService.loginByKakaoCodeForRedirect(code);

        String targetUrl;

        if (result.isSuccess()) {
            targetUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl)
                    .queryParam("status", "SUCCESS")
                    .queryParam("accessToken", result.getAccessToken())
                    .queryParam("refreshToken", result.getRefreshToken())
                    .build()
                    .toUriString();
        } else {
            targetUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl)
                    .queryParam("status", "FAIL")
                    .queryParam("code", result.getCode())
                    .build()
                    .toUriString();
        }

        response.sendRedirect(targetUrl);
    }

    /**
     * 구글 OAuth 콜백
     * - 카카오와 동일한 정책 유지
     */
    @GetMapping("/google/callback")
    public void googleCallback(
            @RequestParam String code,
            HttpServletResponse response
    ) throws IOException {

        SocialLoginResult result =
                authService.loginByGoogleCodeForRedirect(code);

        String targetUrl;

        if (result.isSuccess()) {
            targetUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl)
                    .queryParam("status", "SUCCESS")
                    .queryParam("accessToken", result.getAccessToken())
                    .queryParam("refreshToken", result.getRefreshToken())
                    .build()
                    .toUriString();
        } else {
            targetUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl)
                    .queryParam("status", "FAIL")
                    .queryParam("code", result.getCode())
                    .build()
                    .toUriString();
        }

        response.sendRedirect(targetUrl);
    }

    /* =====================
       이메일 인증
       ===================== */

    /**
     * 회원가입용 이메일 인증 코드 발송
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
     */
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

    /**
     * refresh token 기반 access token 재발급
     *
     * - Authorization 헤더 사용
     * - 실패 시 401 반환
     */
    @PostMapping("/token/reissue")
    public ResponseEntity<TokenReissueResponse> reissue(
            @RequestHeader("Authorization") String authorization
    ) {
        String refreshToken =
                authorization.replace("Bearer ", "");

        String newAccessToken =
                authService.reissueAccessToken(refreshToken);

        return ResponseEntity.ok(
                new TokenReissueResponse(newAccessToken)
        );
    }

    /* =====================
       비밀번호 재설정
       ===================== */

    /**
     * 비밀번호 재설정 요청 (1단계)
     *
     * - 존재하지 않는 이메일도 성공 처리
     */
    @PostMapping("/password/reset-request")
    public ResponseEntity<Void> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDto request
    ) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    /**
     * 비밀번호 재설정 코드 검증 (2단계)
     * - 성공 시 resetToken 발급
     */
    @PostMapping("/password/verify")
    public ResponseEntity<PasswordResetVerifyResponseDto> verifyPasswordResetCode(
            @Valid @RequestBody PasswordResetVerifyRequestDto request
    ) {
        return ResponseEntity.ok(
                authService.verifyPasswordResetCode(request)
        );
    }

    /**
     * 비밀번호 재설정 (3단계)
     *
     * - resetToken 기반 인증
     * - 비밀번호 변경 후 기존 세션 무효화
     */
    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody PasswordResetChangeRequestDto request
    ) {
        String resetToken =
                authorization.replace("Bearer ", "");

        authService.resetPassword(resetToken, request);
        return ResponseEntity.ok().build();
    }
}
