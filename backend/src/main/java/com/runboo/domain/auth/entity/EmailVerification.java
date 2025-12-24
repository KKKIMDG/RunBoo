package com.runboo.domain.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "email_verification")
public class EmailVerification {

    /**
     * 이메일을 PK로 사용
     * - 하나의 이메일은 동시에 하나의 인증 코드만 가질 수 있음
     * - 새로운 인증 요청 시 기존 레코드를 덮어쓰는 구조
     */
    @Id
    @Column(name = "email")
    private String email;

    /**
     * 이메일 인증 코드 (고정 길이 6자리)
     */
    @Column(name = "code", nullable = false, length = 6)
    private String code;

    /**
     * 인증 코드 생성 시각
     * - 만료 시간 계산 및 디버깅 목적
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 인증 코드 만료 시각
     * - 이 시각 이후에는 인증 불가
     */
    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    /**
     * JPA 기본 생성자
     * - 외부 직접 생성을 막기 위해 protected
     */
    protected EmailVerification() {}

    /**
     * 이메일 인증 엔티티 생성 팩토리 메서드

     * 규칙
     * - 생성 시점(now) 기준으로 만료 시간 계산
     * - 만료 단위는 분(minutes)
     */
    public static EmailVerification create(String email, String code, int minutes) {
        LocalDateTime now = LocalDateTime.now();

        EmailVerification ev = new EmailVerification();
        ev.email = email;
        ev.code = code;
        ev.createdAt = now;
        ev.expiredAt = now.plusMinutes(minutes);
        return ev;
    }

    /**
     * 이메일 인증 코드 검증

     * 검증 순서
     * 1. 만료 여부 확인
     * 2. 코드 일치 여부 확인

     * 실패 시 예외를 던져 상위(Service)에서 처리
     */
    public void verify(String inputCode) {
        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("인증 코드가 만료되었습니다.");
        }
        if (!code.equals(inputCode)) {
            throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
        }
    }
}
