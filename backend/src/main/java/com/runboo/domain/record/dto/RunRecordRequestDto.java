package com.runboo.domain.record.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RunRecordRequestDto {
    private Long userId;
    private String mode;
    private Double distanceM;
    private Integer durationSec;
    private Integer avgPace;
    private Integer calories;
    private Integer cadence;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String routePolyline;
}
