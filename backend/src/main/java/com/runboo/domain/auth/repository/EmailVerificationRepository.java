package com.runboo.domain.auth.repository;

import com.runboo.domain.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 이메일 인증 코드 엔티티 접근을 담당하는 Repository
 *
 * 역할
 * - 이메일 기준으로 인증 코드 조회
 * - 만료된 인증 코드 정리
 */
public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, String> {

    /**
     * 이메일을 기준으로 인증 코드 조회
     * - 인증 코드 검증 시 사용
     */
    Optional<EmailVerification> findByEmail(String email);

    /**
     * 만료 시각이 지난 인증 코드 일괄 삭제
     * - 주기적 정리(스케줄러) 또는 재인증 시 사용
     */
    void deleteAllByExpiredAtBefore(LocalDateTime time);
}
