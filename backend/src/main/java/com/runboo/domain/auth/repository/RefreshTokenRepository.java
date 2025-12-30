package com.runboo.domain.auth.repository;

import com.runboo.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
