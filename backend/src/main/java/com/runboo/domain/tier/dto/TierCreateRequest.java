package com.runboo.domain.tier.dto;

import com.runboo.domain.tier.entity.Tier;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TierCreateRequest {

    private String name;
    private String displayName;
    private String distanceType;
    private int minPaceSecPerKm;
    private int maxPaceSecPerKm;

    // DTO -> 엔티티
    public Tier toEntity() {
        return new Tier(
                null,                 // tierId는 생성 시 null
                name,
                displayName,
                distanceType,
                minPaceSecPerKm,
                maxPaceSecPerKm
        );
    }
}
