package com.runboo.domain.user.dto;

import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.enums.SocialProvider;


public record UserMeResponseDto(
        Long userId,
        String email,
        String nickname,
        String profileImageUrl,
        SocialProvider provider,
        boolean isBlind
) {
    public static UserMeResponseDto from(User user) {
        return new UserMeResponseDto(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getSocialProvider(),
                user.isBlind()
        );
    }

}
