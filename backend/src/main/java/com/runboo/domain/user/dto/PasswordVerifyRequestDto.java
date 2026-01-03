package com.runboo.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordVerifyRequestDto(
        @NotBlank
        String currentPassword
) {}
