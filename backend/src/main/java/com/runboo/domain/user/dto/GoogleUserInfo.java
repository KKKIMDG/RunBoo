package com.runboo.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class GoogleUserInfo {

    private String sub;     // 구글 유저 고유값 (providerId)
    private String email;
    private String name;    // 닉네임으로 쓰기
    private String picture; // 프로필 이미지 URL

    @JsonProperty("email_verified")
    private Boolean emailVerified;
}