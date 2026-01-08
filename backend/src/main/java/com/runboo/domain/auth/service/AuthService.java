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
    private final SocialOAuthService socialOAuthService;
    private final KakaoOAuthService kakaoOAuthService;
    private final GoogleOAuthService googleOAuthService;

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetService passwordResetService;

    /**
     * 카카오 인가 코드를 통한 로그인
     */
    @Transactional
    public LoginResponseDto loginByKakaoCode(String code) {
        // 1. 코드를 토큰으로 교환
        String kakaoAccessToken = kakaoOAuthService.getKakaoAccessToken(code);

        // 2. 기존 DTO를 여기서 생성해서 기존 메서드에 전달
        SocialLoginRequestDto requestDto = new SocialLoginRequestDto(kakaoAccessToken, SocialProvider.KAKAO);

        return loginBySocial(requestDto); // 기존에 잘 돌아가던 로직 재사용!
    }
    /**
     * 구글 인가 코드를 통한 로그인
     */
    @Transactional
    public LoginResponseDto loginByGoogleCode(String code) {
        // 1. 구글 서버와 통신하여 액세스 토큰 획득
        String googleAccessToken = googleOAuthService.getGoogleAccessToken(code);

        // 2. 이미 구현된 loginBySocial 로직을 호출 (SocialOAuthService가 분기를 처리해줌)
        return loginBySocial(new SocialLoginRequestDto(googleAccessToken, SocialProvider.GOOGLE));
    }

    /* =====================
       로컬 회원가입
       ===================== */
    @Transactional
    public void signupLocal(LocalSignupRequestDto request) {
        emailAuthService.assertVerified(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 가입된 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.createLocal(request.getEmail(), encodedPassword, request.getNickname());
        userRepository.save(user);
    }

    /* =====================
       이메일 로그인
       ===================== */
    @Transactional
    public LoginResponseDto loginByEmail(LocalLoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일 또는 비밀번호가 올바르지 않습니다."));

        if (user.isSocialUser()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "소셜 로그인 계정입니다.");
        }

        if (user.getUserState() != UserState.ACTIVATION) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        return generateLoginResponse(user, true); // 리팩토링: 토큰 발급 공통 로직
    }

    /* =====================
       소셜 로그인 (공통 로직)
       ===================== */
    @Transactional
    public LoginResponseDto loginBySocial(SocialLoginRequestDto request) {
        System.out.println("로그인 진입!");
        SocialProvider provider = request.getProvider();
        SocialUserInfo socialUser = socialOAuthService.getUserInfo(provider, request.getAccessToken());

        User user = userRepository.findByEmail(socialUser.getEmail())
                .orElseGet(() -> userRepository.save(
                        User.createSocial(socialUser.getEmail(), socialUser.getProvider(), socialUser.getNickname())
                ));

        if (user.getUserState() != UserState.ACTIVATION) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "탈퇴된 계정입니다.");
        }

        return generateLoginResponse(user, false); // 소셜은 14일 만료 정책 적용
    }

    /**
     * 이메일 인증 코드 발송
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

    /**
     * 토큰 발급 및 저장 공통 로직
     */
    private LoginResponseDto generateLoginResponse(User user, boolean isLocal) {
        Long userId = user.getId();
        String accessToken = jwtTokenProvider.createAccessToken(userId);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        String hashedRefreshToken = passwordEncoder.encode(refreshToken);
        refreshTokenRepository.deleteByUserId(userId);

        // 로컬은 3개월, 소셜은 14일 (기존 정책 유지)
        LocalDateTime expiresAt = isLocal ? LocalDateTime.now().plusMonths(3) : LocalDateTime.now().plusDays(14);

        RefreshToken entity = new RefreshToken(userId, hashedRefreshToken, expiresAt);
        refreshTokenRepository.save(entity);

        return LoginResponseDto.from(user, accessToken, refreshToken);
    }

    /* =====================
       토큰 재발급
       ===================== */
    @Transactional
    public String reissueAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 refresh token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        RefreshToken savedToken = refreshTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보 없음"));

        if (savedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "refresh token 만료");
        }

        if (!passwordEncoder.matches(refreshToken, savedToken.getToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "refresh token 불일치");
        }

        return jwtTokenProvider.createAccessToken(userId);
    }

    /**
     * 비밀번호 재설정 요청 (1단계)
     */
    @Transactional
    public void requestPasswordReset(PasswordResetRequestDto request) {

        userRepository.findByEmail(request.getEmail())
                .ifPresent(user -> {
                    // 소셜 계정은 내부적으로만 차단
                    if (user.isSocialUser()) return;

                    String code = passwordResetService.generateCode();
                    passwordResetService.saveCode(request.getEmail(), code);
                    passwordResetService.sendMail(request.getEmail(), code);
                });

        // 존재하지 않는 이메일도 항상 성공 처리
    }
    /**
     * 비밀번호 재설정 코드 검증 (2단계)
     *
     * 처리 흐름
     * 1. 이메일 + 코드 검증
     * 2. 성공 시 resetToken 발급
     * 3. 인증 코드 즉시 삭제 (재사용 방지)
     */
    @Transactional
    public PasswordResetVerifyResponseDto verifyPasswordResetCode(
            PasswordResetVerifyRequestDto request
    ) {
        // 1. 코드 검증 (만료 + 일치 여부)
        PasswordReset passwordReset = passwordResetService.verifyCode(
                request.getEmail(),
                request.getCode()
        );

        // 2. 비밀번호 재설정 전용 토큰 발급
        String resetToken = jwtTokenProvider.createPasswordResetToken(
                passwordReset.getEmail()
        );

        return new PasswordResetVerifyResponseDto(resetToken);
    }
    /**
     * 비밀번호 재설정 (3단계)
     * - resetToken 검증 후 새 비밀번호로 변경
     */
    @Transactional
    public void resetPassword(String resetToken, PasswordResetChangeRequestDto request) {

        String email = jwtTokenProvider.getEmailFromPasswordResetToken(resetToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "사용자를 찾을 수 없습니다."
                ));

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

        user.changePassword(passwordEncoder.encode(request.getNewPassword()));

        // 기존 로그인 세션 무효화
        refreshTokenRepository.deleteByUserId(user.getId());

        // 인증 코드 제거
        //    - 같은 코드 재사용 방지
        //    - resetToken만 유효한 상태로 전환
        passwordResetService.delete(email);
    }
}

