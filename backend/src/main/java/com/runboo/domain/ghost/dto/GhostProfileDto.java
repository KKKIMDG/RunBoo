package com.runboo.domain.ghost.dto;

import com.runboo.domain.ghost.entity.GhostProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GhostProfileDto {

    private Long id;
    private Long runRecordId;
    private String type;
    private Double targetDistanceKm;
    private Integer avgPace;
    private OffsetDateTime createdAt;

    public GhostProfileDto(GhostProfile gp) {
        this.id = gp.getId();
        this.runRecordId = gp.getRunRecordId();
        this.type = gp.getType();
        this.targetDistanceKm = gp.getTargetDistanceKm();
        this.avgPace = gp.getAvgPace();
        this.createdAt = gp.getCreatedAt();
    }
}
