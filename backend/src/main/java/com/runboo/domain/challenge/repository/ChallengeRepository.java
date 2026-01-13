package com.runboo.domain.challenge.repository;

import com.runboo.domain.challenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    Optional<Object> findByTargetTypeAndDifficulty(String targetType, String nextDifficulty);
}
