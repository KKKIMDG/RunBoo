package com.runboo.domain.user.repository;

import com.runboo.domain.user.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, String> {

    Optional<EmailVerification> findByEmail(String email);

    void deleteAllByExpiredAtBefore(LocalDateTime time);
}
