package com.runboo.domain.auth.service;

import com.runboo.domain.auth.dto.*;
import com.runboo.domain.auth.entity.PasswordReset;
import com.runboo.domain.auth.entity.RefreshToken;
import com.runboo.domain.auth.repository.RefreshTokenRepository;
import com.runboo.domain.user.dto.*;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.entity.UserState;
import com.runboo.domain.user.enums.SocialProvider;
import com.runboo.domain.user.repository.UserRepository;
import com.runboo.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    private final EmailAuthService emailAuthService;

    /**
     * 소셜 OAuth 공통 처리용 서비스
     * - provider별 분기 책임
     */
    private final SocialOAuthService socialOAuthService;

    /** provider별 accessToken 발급 전용 */
    private final KakaoOAuthService kakaoOAuthService;
    private final GoogleOAuthService googleOAuthService;

    /** refresh token 영속화 */
    private final RefreshTokenRepository refreshTokenRepository;

    /** 비밀번호 재설정 플로우 관리 */
    private final PasswordResetService passwordResetService;

    /* =====================
       소셜 로그인 (Redirect 전용)
       ===================== */

    /**
     * 소셜 로그인 공통 처리 (redirect 전용)
     *
     * 정책
     * - LOCAL 계정 → 소셜 로그인 차단
     * - 탈퇴 계정 → 로그인 차단
     * - 신규 소셜 계정 → 자동 회원가입
     *
     * ! 예외를 throw 하지 않고 결과 객체로 반환
     *    → OAuth redirect 흐름에서 사용
     */
    @Transactional
    public SocialLoginResult loginBySocialForRedirect(SocialLoginRequestDto request) {

        SocialProvider provider = request.getProvider();

        // 소셜 서버에서 사용자 정보 조회
        SocialUserInfo socialUser =
                socialOAuthService.getUserInfo(provider, request.getAccessToken());

        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);

        // LOCAL 계정이면 소셜 로그인 불가
        if (user != null && user.getSocialProvider() == SocialProvider.LOCAL) {
            return new SocialLoginResult(false, "LOCAL_ACCOUNT", null, null);
        }

        // 탈퇴 / 비활성 계정 차단
        if (user != null && user.getUserState() != UserState.ACTIVATION) {
            return new SocialLoginResult(false, "DEACTIVATED", null, null);
        }

        // 신규 소셜 회원 자동 생성
        if (user == null) {
            user = userRepository.save(
                    User.createSocial(
                            socialUser.getEmail(),
                            provider,
                            socialUser.getNickname()
                    )
            );
        }

        // 로그인 토큰 발급
        LoginResponseDto tokenDto = generateLoginResponse(user, false);

        return new SocialLoginResult(
                true,
                "SUCCESS",
                tokenDto.getAccessToken(),
                tokenDto.getRefreshToken()
        );
    }

    /**
     * 카카오 OAuth callback 전용
     * - 인가 코드 → accessToken 교환
     * - 공통 소셜 로그인 로직 위임
     */
    @Transactional
    public SocialLoginResult loginByKakaoCodeForRedirect(String code) {

        String kakaoAccessToken =
                kakaoOAuthService.getKakaoAccessToken(code);

        return loginBySocialForRedirect(
                new SocialLoginRequestDto(kakaoAccessToken, SocialProvider.KAKAO)
        );
    }

    /**
     * 구글 OAuth callback 전용
     */
    @Transactional
    public SocialLoginResult loginByGoogleCodeForRedirect(String code) {

        String googleAccessToken =
                googleOAuthService.getGoogleAccessToken(code);

        return loginBySocialForRedirect(
                new SocialLoginRequestDto(googleAccessToken, SocialProvider.GOOGLE)
        );
    }

    /* =====================
       로컬 회원가입 / 로그인
       ===================== */

    /**
     * 로컬 회원가입
     *
     * 선행 조건
     * - 이메일 인증 완료
     */
    @Transactional
    public void signupLocal(LocalSignupRequestDto request) {

        emailAuthService.assertVerified(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 가입된 이메일입니다."
            );
        }

        User user = User.createLocal(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getNickname()
        );

        userRepository.save(user);
    }

    /**
     * 이메일 로그인
     *
     * 정책
     * - 소셜 계정 로그인 불가
     * - 탈퇴 계정 로그인 불가
     */
    @Transactional
    public LoginResponseDto loginByEmail(LocalLoginRequestDto request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "이메일 또는 비밀번호가 올바르지 않습니다."
                        )
                );

        if (user.isSocialUser()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "소셜 로그인 계정입니다."
            );
        }

        if (user.getUserState() != UserState.ACTIVATION) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }

        return generateLoginResponse(user, true);
    }

    /* =====================
       이메일 인증
       ===================== */

    /**
     * 회원가입용 이메일 인증 코드 발송
     */
    @Transactional
    public void sendEmailVerifyCode(EmailVerifyRequestDto request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이미 가입된 이메일입니다."
            );
        }

        String code = emailAuthService.generateCode();
        emailAuthService.saveCode(request.getEmail(), code);
        emailAuthService.send(request.getEmail(), code);
    }

    /**
     * 이메일 인증 코드 검증
     */
    @Transactional
    public void verifyEmailCode(EmailVerifyCheckRequestDto request) {
        emailAuthService.verify(request.getEmail(), request.getCode());
    }

    /* =====================
       토큰 발급 공통 로직
       ===================== */

    /**
     * 로그인 성공 시 토큰 발급 + refresh token 저장
     *
     * 정책
     * - LOCAL: 3개월
     * - SOCIAL: 14일
     *
     * 기존 refresh token은 항상 제거 (단일 세션 정책)
     */
    private LoginResponseDto generateLoginResponse(User user, boolean isLocal) {

        Long userId = user.getId();

        String accessToken =
                jwtTokenProvider.createAccessToken(userId);
        String refreshToken =
                jwtTokenProvider.createRefreshToken(userId);

        refreshTokenRepository.deleteByUserId(userId);

        LocalDateTime expiresAt =
                isLocal
                        ? LocalDateTime.now().plusMonths(3)
                        : LocalDateTime.now().plusDays(14);

        refreshTokenRepository.save(
                new RefreshToken(
                        userId,
                        passwordEncoder.encode(refreshToken),
                        expiresAt
                )
        );

        return LoginResponseDto.from(user, accessToken, refreshToken);
    }

    /* =====================
       토큰 재발급
       ===================== */

    /**
     * refresh token 기반 access token 재발급
     *
     * 검증 순서
     * 1. JWT 형식 검증
     * 2. DB 저장 여부
     * 3. 만료 여부
     * 4. 해시 일치 여부
     */
    @Transactional
    public String reissueAccessToken(String refreshToken) {

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "유효하지 않은 refresh token"
            );
        }

        Long userId =
                jwtTokenProvider.getUserIdFromToken(refreshToken);

        RefreshToken savedToken =
                refreshTokenRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "로그인 정보 없음"
                                )
                        );

        if (savedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "refresh token 만료"
            );
        }

        if (!passwordEncoder.matches(refreshToken, savedToken.getToken())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "refresh token 불일치"
            );
        }

        return jwtTokenProvider.createAccessToken(userId);
    }

    /* =====================
       비밀번호 재설정
       ===================== */

    /**
     * 비밀번호 재설정 요청 (1단계)
     *
     * 보안 정책
     * - 존재하지 않는 이메일도 성공 처리
     * - 소셜 계정은 내부적으로만 차단
     */
    @Transactional
    public void requestPasswordReset(PasswordResetRequestDto request) {

        userRepository.findByEmail(request.getEmail())
                .ifPresent(user -> {
                    if (user.isSocialUser()) return;

                    String code = passwordResetService.generateCode();
                    passwordResetService.saveCode(request.getEmail(), code);
                    passwordResetService.sendMail(request.getEmail(), code);
                });
    }

    /**
     * 비밀번호 재설정 코드 검증 (2단계)
     */
    @Transactional
    public PasswordResetVerifyResponseDto verifyPasswordResetCode(
            PasswordResetVerifyRequestDto request
    ) {

        PasswordReset passwordReset =
                passwordResetService.verifyCode(
                        request.getEmail(),
                        request.getCode()
                );

        String resetToken =
                jwtTokenProvider.createPasswordResetToken(
                        passwordReset.getEmail()
                );

        return new PasswordResetVerifyResponseDto(resetToken);
    }

    /**
     * 비밀번호 재설정 (3단계)
     *
     * 처리
     * - 비밀번호 변경
     * - 모든 refresh token 무효화
     * - 인증 코드 제거
     */
    @Transactional
    public void resetPassword(
            String resetToken,
            PasswordResetChangeRequestDto request
    ) {

        String email =
                jwtTokenProvider.getEmailFromPasswordResetToken(resetToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "사용자를 찾을 수 없습니다."
                        )
                );

        if (user.getSocialProvider() != SocialProvider.LOCAL) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다."
            );
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "기존 비밀번호와 다른 비밀번호를 입력해 주세요."
            );
        }

        user.changePassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        refreshTokenRepository.deleteByUserId(user.getId());
        passwordResetService.delete(email);
    }
}
