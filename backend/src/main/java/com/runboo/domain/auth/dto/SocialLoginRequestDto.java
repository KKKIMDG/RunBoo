package com.runboo.domain.auth.dto;

import com.runboo.domain.user.enums.SocialProvider;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SocialLoginRequestDto {
    private String accessToken;
    private SocialProvider provider;
}
