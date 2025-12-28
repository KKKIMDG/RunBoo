package com.runboo.domain.record.dto;

import com.runboo.domain.record.entity.Record;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
public class RecordDto {

    private Long id;
    private Double distanceM;
    private Integer durationSec;
    private Integer avgPace;
    private Integer calories;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;
    private String mode;

    public RecordDto(Record record) {
        this.id = record.getId();
        this.distanceM = record.getDistanceM();

        // ✅ 핵심 수정: DB durationSec이 틀려도 endedAt-startedAt이 있으면 그걸 우선 사용
        this.durationSec = calcDurationSec(record);

        this.avgPace = record.getAvgPace();
        this.calories = record.getCalories();
        this.startedAt = record.getStartedAt();
        this.endedAt = record.getEndedAt();
        this.mode = record.getMode();
    }

    private static Integer calcDurationSec(Record r) {
        if (r.getStartedAt() != null && r.getEndedAt() != null) {
            long sec = Duration.between(r.getStartedAt(), r.getEndedAt()).getSeconds();
            sec = Math.max(sec, 0);

            // Integer 범위 방어 (현실적으로 거의 안 걸리지만 안전하게)
            if (sec > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            return (int) sec;
        }

        // endedAt 없으면 기존 durationSec 사용 (null 방어)
        return r.getDurationSec() != null ? r.getDurationSec() : 0;
    }
}
