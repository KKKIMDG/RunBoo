package com.runboo.domain.challenge.repository;

import com.runboo.domain.challenge.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {
    List<UserChallenge> findByUserIdAndStatus(int userId, String status);
}
