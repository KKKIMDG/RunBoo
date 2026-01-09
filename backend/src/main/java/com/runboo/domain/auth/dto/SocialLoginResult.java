package com.runboo.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SocialLoginResult {
    private boolean success;
    private String code;          // FAIL 시: LOCAL_ACCOUNT, DEACTIVATED
    private String accessToken;   // SUCCESS 시만
    private String refreshToken;  // SUCCESS 시만
}
