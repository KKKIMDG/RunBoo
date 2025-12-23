package com.runboo.domain.record.repository;

import com.runboo.domain.record.entity.RunRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RunRecordRepository extends JpaRepository<RunRecord, Long> {

}
