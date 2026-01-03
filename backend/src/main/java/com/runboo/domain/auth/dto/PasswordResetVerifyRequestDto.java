package com.runboo.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

/**
 * 비밀번호 재설정 코드 검증 요청 DTO
 *
 * 사용 목적
 * - 이메일 + 인증 코드로 1차 본인 확인
 * - 성공 시 resetToken 발급을 위한 입력값
 */
@Getter
public class PasswordResetVerifyRequestDto {

    // 비밀번호 재설정을 요청한 이메일
    @Email
    @NotBlank
    private String email;

    // 이메일로 받은 6자리 인증 코드
    @NotBlank
    private String code;
}
