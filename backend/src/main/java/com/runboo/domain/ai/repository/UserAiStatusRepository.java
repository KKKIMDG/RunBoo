package com.runboo.domain.ai.repository;

import com.runboo.domain.ai.entity.UserAiStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAiStatusRepository extends JpaRepository<UserAiStatus, Long> {
    Optional<UserAiStatus> findByUserId(Long userId);
}
