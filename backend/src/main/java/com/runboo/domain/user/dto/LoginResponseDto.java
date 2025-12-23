package com.runboo.domain.user.dto;

import com.runboo.domain.user.entity.User;
import lombok.Getter;
/**
 로그인 응답
 */
@Getter
public class LoginResponseDto {

    private Long id;
    private String email;
    private String nickname;
    private String profileImageUrl;
    private String accessToken;

    private LoginResponseDto(
            Long id,
            String email,
            String nickname,
            String profileImageUrl,
            String accessToken
    ) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.accessToken = accessToken;
    }

    public static LoginResponseDto from(User user, String accessToken) {
        return new LoginResponseDto(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImageUrl(),
                accessToken
        );
    }
}


