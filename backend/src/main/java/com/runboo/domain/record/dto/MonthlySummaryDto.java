package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlySummaryDto {
    private Long totalRuns;
    private Double totalDistanceM;
    private Long totalDurationSec;
    private Long totalCalories;
}
