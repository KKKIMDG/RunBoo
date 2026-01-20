package com.runboo.domain.challenge.repository;

import com.runboo.domain.challenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findBySeason_SeasonIdOrderByLevelAsc(Long seasonId);

}
