package com.runboo.domain.challenge.repository;

import com.runboo.domain.challenge.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {

    Optional<UserChallenge> findByUserIdAndStatus(Long userId, String status);

    // [추가] 특정 유저의 특정 레벨 챌린지 조회 (상태 변경용)
    @Query("SELECT uc FROM UserChallenge uc WHERE uc.userId = :userId AND uc.challenge.level = :level")
    Optional<UserChallenge> findByUserIdAndChallengeLevel(@Param("userId") Long userId, @Param("level") int level);

    // [추가] 특정 레벨이 이미 생성되었는지 확인 (지연 생성 방어 로직용)
    @Query("SELECT COUNT(uc) > 0 FROM UserChallenge uc WHERE uc.userId = :userId AND uc.challenge.level = :level")
    boolean existsByUserIdAndChallengeLevel(@Param("userId") Long userId, @Param("level") int level);

    // [추가] 유저가 해당 시즌에 이미 참여 중인지 확인
    boolean existsByUserIdAndChallenge_Season(Long userId, com.runboo.domain.season.entity.Season season);

    // 현재+다음2개 조회를 위한 기존 쿼리 (필요시 레벨 조건 확인)
    @Query("SELECT uc FROM UserChallenge uc JOIN FETCH uc.challenge c " +
            "WHERE uc.userId = :userId AND c.level BETWEEN :start AND :end " +
            "ORDER BY c.level ASC")
    List<UserChallenge> findActiveAndNextTwo(@Param("userId") Long userId, @Param("start") int start, @Param("end") int end);
}