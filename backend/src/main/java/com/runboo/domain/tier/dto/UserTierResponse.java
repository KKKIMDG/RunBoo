package com.runboo.domain.tier.dto;

import com.runboo.domain.tier.entity.UserTier;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserTierResponse {

    private Long userTierId;
    private Long userId;
    private Long tierId;
    private String distanceType;

    // 엔티티 -> DTO 변환 메서드
    public static UserTierResponse from(UserTier userTier) {
        return new UserTierResponse(
                userTier.getId(),
                userTier.getUser().getId(),
                userTier.getTier().getTierId(),
                userTier.getDistanceType().name() // Enum일 경우 name() 사용
        );
    }
}