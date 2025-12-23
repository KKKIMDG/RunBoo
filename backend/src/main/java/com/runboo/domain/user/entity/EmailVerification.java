package com.runboo.domain.user.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "email_verification")
public class EmailVerification {

    @Id
    @Column(name = "email")
    private String email;

    @Column(name = "code", nullable = false, length = 6)
    private String code;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    protected EmailVerification() {}

    public static EmailVerification create(String email, String code, int minutes) {
        LocalDateTime now = LocalDateTime.now();

        EmailVerification ev = new EmailVerification();
        ev.email = email;
        ev.code = code;
        ev.createdAt = now;
        ev.expiredAt = now.plusMinutes(minutes);
        return ev;
    }

    public void verify(String inputCode) {
        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("인증 코드가 만료되었습니다.");
        }
        if (!code.equals(inputCode)) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
        }
    }
}
