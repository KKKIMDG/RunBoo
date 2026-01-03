package com.runboo.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PasswordResetChangeRequestDto {

    @NotBlank
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
