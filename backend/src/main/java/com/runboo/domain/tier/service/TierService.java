package com.runboo.domain.tier.service;

import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import com.runboo.domain.tier.dto.TierResponse;
import com.runboo.domain.tier.entity.Tier;
import com.runboo.domain.tier.repository.TierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // final필드와 @NonNull 필드를 대상으로 자동으로 생성자를 생성
public class TierService {

    private final RunRecordRepository runRecordRepository;
    private final TierRepository tierRepository;

    // 기록테이블에 recordId와 일치하는 행에서, pace를 꺼냄, 꺼내고 페이스 범위의 티어의 id를 찾음
    public TierResponse evaluateByRecord(Long recordId, String distanceType) {
        // 기록테이블에 recordId와 일치하는 행 찾음
        RunRecord record = runRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자의 기록이 없습니다."));

        // pace만 Record에서 꺼냄
        int pace = record.getAvgPace();

        // 전달받은 distanceType 기준으로 Tier 조회
        Tier tier = tierRepository.findTierByPace(distanceType, pace)
                .orElseThrow(() -> new IllegalStateException("해당 페이스의 티어가 없습니다."));

        return TierResponse.from(tier);
    }
}
