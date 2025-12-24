package com.runboo.domain.ghost.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GhostProfileCreateRequest {
    private Long userId;
    private Long runRecordId;
    private String type;            // 예: "PERSONAL_BEST", "CUSTOM" 등 (팀 규칙에 맞춰 사용)
    private Double targetDistanceKm;
    private Integer avgPace;
}
