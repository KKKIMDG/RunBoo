package com.runboo.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LocalSignupRequestDto {

    private String email;
    private String password; // 일반 회원가입만 사용
    private String nickname;

    public LocalSignupRequestDto(LocalSignupRequestDto localUserCreateDto) {
        this.email =  localUserCreateDto.email;
        this.password = localUserCreateDto.password;
        this.nickname = localUserCreateDto.nickname;
    }
}
