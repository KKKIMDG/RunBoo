package com.runboo.domain.record.repository;

import com.runboo.domain.record.entity.RunRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RunRecordRepository extends JpaRepository<RunRecord, Long> {
    Optional<RunRecord> findTopByUserIdAndAvgPaceGreaterThanOrderByAvgPaceAsc(Long userId, Integer minPace);

    // ✅ 친구들 user.id IN (...) + mode = 'TIER'(대소문자 무시) + avgPace 빠른 순
    List<RunRecord> findByUser_IdInAndModeIgnoreCaseOrderByAvgPaceAsc(List<Long> userIds, String mode);
}
