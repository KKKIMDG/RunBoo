package com.runboo.domain.record.repository;

import com.runboo.domain.record.entity.RunRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RunRecordRepository extends JpaRepository<RunRecord, Long> {
    Optional<RunRecord> findTopByUserIdAndAvgPaceGreaterThanOrderByAvgPaceAsc(Long userId, Integer minPace);

    List<RunRecord> findByUserIdInAndModeOrderByAvgPaceAsc(List<Long> userIds, String mode);
}
