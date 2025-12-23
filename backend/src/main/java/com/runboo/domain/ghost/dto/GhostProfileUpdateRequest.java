package com.runboo.domain.ghost.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GhostProfileUpdateRequest {
    private Long userId;            // 소유자 확인용
    private Long runRecordId;
    private String type;
    private Double targetDistanceKm;
    private Integer avgPace;
}
