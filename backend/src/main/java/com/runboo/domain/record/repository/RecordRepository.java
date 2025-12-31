package com.runboo.domain.record.repository;

import com.runboo.domain.record.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface RecordRepository extends JpaRepository<Record, Long> {

    // 내 기록 전체 (최신순)
    List<Record> findByUserIdOrderByStartedAtDesc(Long userId);

    // 기간별 기록 (월/주 통계 계산용으로도 사용)
    List<Record> findByUserIdAndStartedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    // 개인 최고 기록(PB) 4종
    Optional<Record> findTopByUserIdOrderByDistanceMDesc(Long userId);
    Optional<Record> findTopByUserIdOrderByDurationSecDesc(Long userId);
    Optional<Record> findTopByUserIdOrderByAvgPaceAsc(Long userId); // avgPace 낮을수록 빠름
    Optional<Record> findTopByUserIdOrderByCaloriesDesc(Long userId);
}
