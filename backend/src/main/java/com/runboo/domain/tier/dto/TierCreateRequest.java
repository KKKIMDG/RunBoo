package com.runboo.domain.tier.dto;

import com.runboo.domain.tier.entity.Tier;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TierCreateRequest {

    private Long recordId;
    private String name;
    private String displayName;
    private String distanceType;
    private int minPaceSecPerKm;
    private int maxPaceSecPerKm;
}
