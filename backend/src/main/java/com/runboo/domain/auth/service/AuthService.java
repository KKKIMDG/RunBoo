package com.runboo.domain.auth.service;

import com.runboo.domain.auth.dto.*;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailAuthService emailAuthService;
    private final SocialOAuthService socialOAuthService;

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

        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

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

        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        return LoginResponseDto.from(user, accessToken, refreshToken);
    }

    /**
     * 토큰재발급
     */
    public String reissueAccessToken(String refreshToken) {

        // 1. refresh token 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "유효하지 않은 refresh token"
            );
        }

        // 2. refresh token에서 userId 추출
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        // 3. 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "사용자 없음"
                ));

        // 4. 새 access token 발급
        return jwtTokenProvider.createAccessToken(userId);
    }
}
