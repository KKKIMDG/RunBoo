package com.runboo.domain.season.repository;

import com.runboo.domain.season.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface SeasonRepository extends JpaRepository<Season, Long> {
    // 현재 시간이 시작일과 종료일 사이에 있는 시즌 하나를 가져옴
    @Query("SELECT s FROM Season s WHERE :now BETWEEN s.startedAt AND s.endedAt")
    Optional<Season> findCurrentSeason(@Param("now") LocalDateTime now);
}
