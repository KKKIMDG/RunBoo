package com.runboo.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 비밀번호 재설정 코드 검증 응답 DTO
 *
 * resetToken은
 * - 비밀번호 변경 전용
 * - access / refresh 토큰과 완전히 분리됨
 */
@Getter
@AllArgsConstructor
public class PasswordResetVerifyResponseDto {

    // 비밀번호 변경 권한을 증명하는 임시 토큰
    private String resetToken;
}
