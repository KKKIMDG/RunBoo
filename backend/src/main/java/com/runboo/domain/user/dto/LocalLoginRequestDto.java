package com.runboo.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 로그인 요청
 */
@Getter
@NoArgsConstructor
public class LocalLoginRequestDto {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;
}
