package com.runboo.domain.challenge.repository;

import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {
    Optional<UserChallenge> findByUserIdAndStatus(Long userId, String status);

    @Query("SELECT uc FROM UserChallenge uc JOIN FETCH uc.challenge c " +
            "WHERE uc.userId = :userId AND c.level BETWEEN :startLevel AND :endLevel " +
            "ORDER BY c.level ASC")
    List<UserChallenge> findActiveAndNextTwo(Long userId, int startLevel, int endLevel);

    Optional<UserChallenge> findByUserIdAndChallengeLevel(Long userId, int nextLevel);
}
