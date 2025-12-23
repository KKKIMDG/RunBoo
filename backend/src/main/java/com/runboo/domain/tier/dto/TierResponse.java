package com.runboo.domain.tier.dto;

import com.runboo.domain.tier.entity.Tier;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TierResponse {

    private Long tierId;
    private String name;
    private String displayName;
    private String distanceType;
    private int minPaceSecPerKm;
    private int maxPaceSecPerKm;
    private String imageUrl;

    // 엔티티 -> DTO
    public static TierResponse from(Tier tier) {
        return new TierResponse(
                tier.getTierId(),
                tier.getName(),
                tier.getDisplayName(),
                tier.getDistanceType(),
                tier.getMinPaceSecPerKm(),
                tier.getMaxPaceSecPerKm(),
                tier.getImageUrl()
        );
    }
}
