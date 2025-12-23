package com.runboo.domain.record.dto;

import com.runboo.domain.record.entity.Record;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
        this.durationSec = record.getDurationSec();
        this.avgPace = record.getAvgPace();
        this.calories = record.getCalories();
        this.startedAt = record.getStartedAt();
        this.endedAt = record.getEndedAt();
        this.mode = record.getMode();
    }
}
