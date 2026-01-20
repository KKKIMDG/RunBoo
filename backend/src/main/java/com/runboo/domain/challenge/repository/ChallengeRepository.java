package com.runboo.domain.challenge.repository;

import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.season.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    // 시즌별 레벨 정렬 조회 (기존)
    List<Challenge> findBySeason_SeasonIdOrderByLevelAsc(Long seasonId);

    // [추가] 초기화 시 1~3레벨만 가져오기 위한 쿼리
    List<Challenge> findBySeasonAndLevelBetween(Season season, int startLevel, int endLevel);

    // [추가] 다음 레벨 마스터 정보를 찾기 위한 쿼리
    Optional<Challenge> findBySeasonAndLevel(Season season, int level);
}