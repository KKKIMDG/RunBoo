package com.runboo.domain.ghost.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GhostProfileUpdateRequest {
    private Long userId;
    private Long runRecordId;
    private String type;
    private Double targetDistanceKm;
    private Integer avgPace;
}
