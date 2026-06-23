package com.runboo.domain.auth.repository;

import com.runboo.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByUserId(Long userId);


    @Modifying
    @Query("delete from RefreshToken rt where rt.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
