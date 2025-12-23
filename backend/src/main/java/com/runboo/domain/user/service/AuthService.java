package com.runboo.domain.user.service;

import com.runboo.domain.user.dto.*;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.enums.SocialProvider;
import com.runboo.domain.user.repository.UserRepository;
import com.runboo.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    // private final EmailAuthService emailAuthService;
    // private final SocialOAuthService socialOAuthService;

    /**
     * 로컬 회원가입
     */
    @Transactional
    public void signupLocal(LocalSignupRequestDto request) {

        // 1. 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 3. 사용자 생성 (LOCAL 고정)
        User user = User.createLocal(
                request.getEmail(),
                encodedPassword,
                request.getNickname()
        );

        // 4. 저장
        userRepository.save(user);
    }

    /**
     * 이메일 로그인
     */
    public LoginResponseDto loginByEmail(LocalLoginRequestDto request) {

        // 1. 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        // 2. 소셜 계정 차단
        if (user.isSocialUser()) {
            throw new IllegalStateException("소셜 로그인 계정입니다.");
        }

        // 3. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        // 4. JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());

        return LoginResponseDto.from(user, accessToken);
    }

    /**
     * 소셜 로그인
     */
    @Transactional
    public LoginResponseDto loginBySocial(SocialLoginRequestDto request) {

        SocialProvider provider = request.getProvider();

        // 1. 소셜 accessToken 검증 및 사용자 정보 조회
        /*
        SocialUserInfo socialUser = socialOAuthService.getUserInfo(
                provider, request.getAccessToken()
        );
        */

        // 임시 값 (OAuth 붙이기 전)
        String email = "temp@" + provider.name().toLowerCase() + ".com";
        String nickname = provider.name() + "_user";

        // 2. 기존 회원 조회 or 생성
        User user = userRepository.findByEmail(email)
                .orElseGet(() ->
                        userRepository.save(
                                User.createSocial(email, provider, nickname)
                        )
                );

        // 3. JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());

        return LoginResponseDto.from(user, accessToken);
    }

    /**
     * 이메일 인증 코드 발송
     */
    @Transactional
    public void sendEmailVerifyCode(EmailVerifyRequestDto request) {

        // 1. 이미 가입된 이메일인지 확인
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 2. 인증 코드 생성 및 저장
        // String code = emailAuthService.generateCode();
        // emailAuthService.saveCode(request.getEmail(), code);

        // 3. 이메일 발송
        // emailAuthService.send(request.getEmail(), code);
    }

    /**
     * 이메일 인증 코드 검증
     */
    @Transactional
    public void verifyEmailCode(EmailVerifyCheckRequestDto request) {

        // 1. 저장된 인증 코드 조회
        // String savedCode = emailAuthService.getCode(request.getEmail());

        // 2. 코드 비교
        // if (!request.getCode().equals(savedCode)) {
        //     throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
        // }

        // 3. 인증 완료 처리
        // emailAuthService.markVerified(request.getEmail());
    }
}
