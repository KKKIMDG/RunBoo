package com.runboo.domain.badge.dto;

import com.runboo.domain.badge.entity.Badge;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeDto {
    private Long userBadgeId;
    private Long userId;
    private Long badgeId;
    private String name;
    private String description;
    private String iconUrl;
    private LocalDateTime acquiredAt;

    public static BadgeDto from(Badge entity) {
        return BadgeDto.builder()
                .userBadgeId(entity.getUserBadgeId())
                .badgeId(entity.getBadgeId())
                .name(entity.getName())
                .description(entity.getDescription())
                .iconUrl(entity.getIconUrl())
                .acquiredAt(entity.getAcquiredAt())
                .build();
    }
}