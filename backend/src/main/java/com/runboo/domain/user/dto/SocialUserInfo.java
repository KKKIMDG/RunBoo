package com.runboo.domain.user.dto;

import com.runboo.domain.user.enums.SocialProvider;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SocialUserInfo {

    private SocialProvider provider; // KAKAO / GOOGLE
    private String providerId;       // 카카오 id / 구글 sub (고유 식별자)
    private String email;
    private String nickname;
    private String profileImageUrl;
}
