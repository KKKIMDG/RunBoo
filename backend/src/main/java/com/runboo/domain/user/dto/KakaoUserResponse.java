package com.runboo.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class KakaoUserResponse {

    private Long id;

    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;

    private Properties properties;

    @Getter
    public static class KakaoAccount {

        private String email;
        private Profile profile;
    }

    @Getter
    public static class Profile {
        private String nickname;
        @JsonProperty("profile_image_url")
        private String profileImageUrl;
    }

    @Getter
    public static class Properties {
        private String nickname;
    }
}
