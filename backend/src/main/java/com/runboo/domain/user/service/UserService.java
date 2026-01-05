package com.runboo.domain.user.service;

import com.runboo.domain.auth.repository.RefreshTokenRepository;
import com.runboo.domain.user.dto.PasswordChangeRequestDto;
import com.runboo.domain.user.dto.UserMeResponseDto;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.enums.SocialProvider;
import com.runboo.domain.user.repository.UserRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private static final String REDIS_RUNNER_KEY = "active_runners";

    /**
     * 내 정보 조회
     */
    @Transactional(readOnly = true)
    public UserMeResponseDto getMyInfo() {
        User user = getCurrentUser();
        return UserMeResponseDto.from(user);
    }

    /**
     * 내 닉네임 수정
     */
    @Transactional
    public void updateMyNickname(String nickname) {
        User user = getCurrentUser();
        user.changeNickname(nickname);
    }

    /**
     * 내 프로필 사진 수정
     */
    @Transactional
    public void updateMyProfileImage(String profileImageUrl) {
        User user = getCurrentUser();
        user.changeProfileImageUrl(profileImageUrl);
    }

    /**
     * 현재 비밀번호 검증
     */
    @Transactional(readOnly = true)
    public void verifyCurrentPassword(String currentPassword) {
        User user = getCurrentUser();

        // 소셜 로그인 계정 차단
        if (user.getSocialProvider() != SocialProvider.LOCAL) {
            throw new IllegalStateException("소셜 로그인 계정은 비밀번호를 사용할 수 없습니다.");
        }

        // 현재 비밀번호 검증
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(String newPassword) {
        User user = getCurrentUser();

        // 소셜 로그인 계정 차단
        if (user.getSocialProvider() != SocialProvider.LOCAL) {
            throw new IllegalStateException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }
        // 기존 비밀번호와 동일한지 체크
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("기존 비밀번호와 다른 비밀번호를 입력해 주세요.");
        }

        // 새 비밀번호 암호화 후 저장
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        user.changePassword(encodedNewPassword);

        Long userId = user.getId();
        refreshTokenRepository.deleteByUserId(userId);

    }

    /**
     * 계정 탈퇴
     */
    @Transactional
    public void withdraw() {
        User user = getCurrentUser();
        userRepository.delete(user);
    }

    /**
     * 공통 유저 조회 메서드
     */
    private User getCurrentUser() {
        Long userId = SecurityUtil.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("유저를 찾을 수 없습니다. userId=" + userId)
                );
    }
    @Transactional
    public void updateBlindStatus(boolean isBlind) {
        User user = getCurrentUser();

        user.changeBlindStatus(isBlind);

        if (isBlind) {
            redisTemplate.opsForGeo().remove(REDIS_RUNNER_KEY, user.getId().toString());
        }
    }
}
