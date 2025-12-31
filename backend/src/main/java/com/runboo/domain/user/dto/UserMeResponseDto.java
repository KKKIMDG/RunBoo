package com.runboo.domain.user.dto;

import com.runboo.domain.user.entity.User;

public record UserMeResponseDto(
        Long userId,
        String nickname,
        String profileImageUrl
) {
    public static UserMeResponseDto from(User user) {
        return new UserMeResponseDto(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl()
        );
    }
}
