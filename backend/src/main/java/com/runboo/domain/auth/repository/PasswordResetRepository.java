package com.runboo.domain.auth.repository;

import com.runboo.domain.auth.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, String> {
}
