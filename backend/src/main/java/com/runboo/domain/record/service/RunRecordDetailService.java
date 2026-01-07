package com.runboo.domain.record.service;

import com.runboo.domain.record.dto.RunRecordDetailResponse;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RunRecordDetailService {

    private final RunRecordRepository runRecordRepository;

    @Transactional(readOnly = true)
    public RunRecordDetailResponse getDetail(Long userId, Long recordId) {
        RunRecord record = runRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("해당 기록이 없습니다. recordId=" + recordId));

        // ✅ 내 기록만 열람 가능
        Long ownerId = record.getUser() != null ? record.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(userId)) {
            throw new RuntimeException("접근 권한이 없습니다.");
        }

        return new RunRecordDetailResponse(record);
    }
}
