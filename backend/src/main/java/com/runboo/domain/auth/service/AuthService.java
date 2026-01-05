package com.runboo.domain.auth.service;

import com.runboo.domain.auth.dto.*;
import com.runboo.domain.auth.entity.PasswordReset;
import com.runboo.domain.auth.entity.RefreshToken;
import com.runboo.domain.auth.repository.RefreshTokenRepository;
import com.runboo.domain.user.dto.*;
import com.runboo.domain.user.entity.User;
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
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetService passwordResetService;
    /**
     * 로컬 회원가입
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

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.createLocal(
                request.getEmail(),
                encodedPassword,
                request.getNickname()
        );

        userRepository.save(user);
    }

    /**
     * 이메일 로그인
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

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이메일 또는 비밀번호가 올바르지 않습니다."
            );
        }
        Long userId = user.getId();
        String accessToken = jwtTokenProvider.createAccessToken(userId);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        // refresh token 해시
        String hashedRefreshToken = passwordEncoder.encode(refreshToken);

        refreshTokenRepository.deleteByUserId(userId); //기존 refresh 토큰 삭제

        RefreshToken entity = new RefreshToken( //refresh 토큰 재발급
                userId,
                hashedRefreshToken,
                LocalDateTime.now().plusMonths(3) // 만료 정책
        );
        refreshTokenRepository.save(entity); //refresh 토큰 저장

        return LoginResponseDto.from(user, accessToken, refreshToken);
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
     * 소셜 로그인
     */
    @Transactional
    public LoginResponseDto loginBySocial(SocialLoginRequestDto request) {

        SocialProvider provider = request.getProvider();

        SocialUserInfo socialUser =
                socialOAuthService.getUserInfo(provider, request.getAccessToken());

        User user = userRepository.findByEmail(socialUser.getEmail())
                .orElseGet(() ->
                        userRepository.save(
                                User.createSocial(
                                        socialUser.getEmail(),
                                        socialUser.getProvider(),
                                        socialUser.getNickname()
                                )
                        )
                );

        Long userId = user.getId();
        String accessToken = jwtTokenProvider.createAccessToken(userId);
        String refreshToken = jwtTokenProvider.createRefreshToken(userId);

        refreshTokenRepository.deleteByUserId(userId); //기존 refresh 토큰 삭제
        RefreshToken entity = new RefreshToken( //refresh 토큰 재발급
                userId,
                refreshToken,
                LocalDateTime.now().plusDays(14) // 만료 정책
        );
        refreshTokenRepository.save(entity); //refresh 토큰 저장

        return LoginResponseDto.from(user, accessToken, refreshToken);
    }

    /**
     * 토큰재발급
     */
    @Transactional
    public String reissueAccessToken(String refreshToken) {

        // 1. refresh token 서명 + 만료 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "유효하지 않은 refresh token"
            );
        }

        // 2. refresh token에서 userId 추출
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        // 3. DB에 저장된 refresh token 조회
        RefreshToken savedToken = refreshTokenRepository
                .findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "로그인 정보 없음"
                ));

        // 4. DB 만료 시간 검증 (중요)
        if (savedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "refresh token 만료"
            );
        }
        // 5. 해시 비교
        if (!passwordEncoder.matches(refreshToken, savedToken.getToken())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "refresh token 불일치"
            );
        }
        // 6. 새 access token 발급
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

        // 3. 인증 코드 제거
        //    - 같은 코드 재사용 방지
        //    - resetToken만 유효한 상태로 전환
        passwordResetService.delete(passwordReset.getEmail());

        return new PasswordResetVerifyResponseDto(resetToken);
    }
    /**
     * 비밀번호 재설정 (3단계)
     * - resetToken 검증 후 새 비밀번호로 변경
     */
    @Transactional
    public void resetPassword(String resetToken, PasswordResetChangeRequestDto request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "비밀번호가 일치하지 않습니다."
            );
        }

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
    }
}

