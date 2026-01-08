package com.runboo.domain.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class RegisterPushDeviceRequestDto {

    @NotBlank
    private String token;

    @NotNull
    private Platform platform;

    public enum Platform {
        ANDROID,
        IOS
    }
}
