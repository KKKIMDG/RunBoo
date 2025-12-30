package com.runboo.domain.record.service;

import com.runboo.domain.record.dto.RecordDetailResponse;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RunRecordService {

    private final RunRecordRepository runRecordRepository;

    /**
     * 기록 상세 정보 조회
     * @param recordId 조회할 기록의 ID
     * @return 가공된 기록 상세 DTO
     */
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 성능 최적화
    public RecordDetailResponse getRecordDetail(Long recordId) {
        // 1. DB에서 ID로 해당 기록을 찾습니다.
        // 찾는 데이터가 없을 경우 에러 메시지를 던집니다.
        RunRecord record = runRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("해당 러닝 기록을 찾을 수 없습니다. ID: " + recordId));

        // 2. 찾아온 엔티티(Entity)를 DTO로 변환하여 반환합니다.
        // DTO의 생성자에서 시간 계산 및 포맷팅 로직이 자동으로 실행됩니다.
        return new RecordDetailResponse(record);
    }
}