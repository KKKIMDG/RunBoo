package com.runboo.domain.auth.controller;

import com.runboo.domain.auth.dto.*;
import com.runboo.domain.auth.service.AuthService;
import com.runboo.domain.user.enums.SocialProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @Value("${app.frontend.url}")
    private String frontendUrl;

    /* =====================
       로그인 / 회원가입
       ===================== */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> emailLogin(
            @Valid @RequestBody LocalLoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.loginByEmail(request));
    }

    /**
     * [기존 방식 - 주석 처리]
     * 프론트엔드에서 카카오 액세스 토큰을 직접 받아 전달하던 방식입니다.
     * 백엔드 리다이렉트 방식을 사용하므로 더 이상 사용하지 않습니다.
     */
    /*
    @PostMapping("/login/oauth")
    public ResponseEntity<LoginResponseDto> socialLogin(
            @Valid @RequestBody SocialLoginRequestDto request
    ) {
        return ResponseEntity.ok(authService.loginBySocial(request));
    }
    */

    /**
     * [신규 방식] 카카오 로그인 콜백
     * 카카오 인증 서버가 인가 코드(code)를 이쪽으로 보내줍니다.
     */
    @GetMapping("/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code) {
        // 1. 서비스에서 인가 코드를 통해 로그인 처리 (내부적으로 카카오 토큰 교환 포함)
        // 이 로직을 위해 authService.loginByKakaoCode(code) 같은 메서드 구현이 필요합니다.
        LoginResponseDto loginRes = authService.loginByKakaoCode(code);

        // 2. 앱(프론트)으로 돌아갈 주소 설정
        // 앱의 가로채기 주소(REDIRECT_URL)에 토큰을 쿼리 파라미터로 붙입니다.
        String targetUrl = UriComponentsBuilder
                // 테스트 시에는 프론트 주소, 실제 운영 시에는 실제 도메인 사용
                .fromHttpUrl(frontendUrl)
                .queryParam("accessToken", loginRes.getAccessToken())
                .queryParam("refreshToken", loginRes.getRefreshToken())
                .build().toUriString();

        // 3. 브라우저 리다이렉트 실행
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(targetUrl));

        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/google/callback")
    public ResponseEntity<Void> googleCallback(@RequestParam String code) {
        // 1. 구글 코드로 우리 서비스 로그인 처리
        LoginResponseDto loginRes = authService.loginByGoogleCode(code);

        // 2. 앱으로 복귀 (카카오와 동일한 방식)
        String targetUrl = UriComponentsBuilder
                .fromHttpUrl(frontendUrl)
                .queryParam("accessToken", loginRes.getAccessToken())
                .queryParam("refreshToken", loginRes.getRefreshToken())
                .build().toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(targetUrl));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
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

    @PostMapping("/password/reset-request")
    public ResponseEntity<Void> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequestDto request
    ) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/verify")
    public ResponseEntity<PasswordResetVerifyResponseDto> verifyPasswordResetCode(
            @Valid @RequestBody PasswordResetVerifyRequestDto request
    ) {
        return ResponseEntity.ok(
                authService.verifyPasswordResetCode(request)
        );
    }

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