package com.runboo.domain.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 비밀번호 재설정 인증 엔티티
 *
 * 책임
 * - 비밀번호 재설정 요청 시 발급된 인증 코드 관리
 * - 만료 시간 검증
 *
 * 주의
 * - 회원가입 이메일 인증(EmailVerification)과 절대 섞지 않는다
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordReset {

    @Id
    private String email;

    private String code;

    private LocalDateTime expiresAt;

    protected PasswordReset(String email, String code, LocalDateTime expiresAt) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
    }

    /**
     * 비밀번호 재설정 코드 생성
     *
     * @param minutes 유효 시간(분)
     */
    public static PasswordReset create(String email, String code, int minutes) {
        return new PasswordReset(
                email,
                code,
                LocalDateTime.now().plusMinutes(minutes)
        );
    }

    /**
     * 인증 코드 검증
     */
    public void verify(String inputCode) {
        if (expiresAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("비밀번호 재설정 코드가 만료되었습니다.");
        }

        if (!this.code.equals(inputCode)) {
            throw new IllegalArgumentException("비밀번호 재설정 코드가 올바르지 않습니다.");
        }
    }
}
