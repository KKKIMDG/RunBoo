package com.runboo.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 로그인 요청
 */
@Getter
@NoArgsConstructor
public class LocalLoginRequestDto {
    private String email;
    private String password;
}
