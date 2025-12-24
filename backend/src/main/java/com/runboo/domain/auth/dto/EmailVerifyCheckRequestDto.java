package com.runboo.domain.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EmailVerifyCheckRequestDto {

    private String email;
    private String code;
}
