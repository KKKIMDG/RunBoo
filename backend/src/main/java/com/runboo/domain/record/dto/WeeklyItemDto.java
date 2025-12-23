package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class WeeklyItemDto {
    private LocalDate date;
    private Long runs;
    private Double distanceM;
    private Long durationSec;
    private Long calories;
}
