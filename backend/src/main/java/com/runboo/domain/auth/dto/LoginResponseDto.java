package com.runboo.domain.auth.dto;

import com.runboo.domain.user.entity.User;
import lombok.Getter;

/**
 * 로그인 성공 시 클라이언트에 반환하는 응답 DTO
 *
 * 역할
 * - 인증 결과로 필요한 최소한의 사용자 정보만 노출
 * - User 엔티티를 그대로 반환하지 않기 위한 응답 전용 객체
 *
 * 포함 정보
 * - 사용자 식별 정보(id, email, nickname, profileImageUrl)
 * - 인증 토큰(accessToken, refreshToken)
 */
@Getter
public class LoginResponseDto {

    // 사용자 고유 식별자
    private Long id;

    // 로그인에 사용된 이메일
    private String email;

    // 서비스 내 표시용 닉네임
    private String nickname;

    // 프로필 이미지 URL (없을 수 있음)
    private String profileImageUrl;

    // 인증 성공 후 발급된 Access Token
    private String accessToken;

    // Access Token 재발급을 위한 Refresh Token
    private String refreshToken;

    /**
     * 외부 생성을 제한하기 위해 private 생성자 사용
     */
    private LoginResponseDto(
            Long id,
            String email,
            String nickname,
            String profileImageUrl,
            String accessToken,
            String refreshToken
    ) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    /**
     * User 엔티티 + access / refresh token 기반 로그인 응답 생성
     */
    public static LoginResponseDto from(
            User user,
            String accessToken,
            String refreshToken
    ) {
        return new LoginResponseDto(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImageUrl(),
                accessToken,
                refreshToken
        );
    }
}
