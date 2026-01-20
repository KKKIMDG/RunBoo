package com.runboo.domain.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserBadgeDto {
    private Long userBadgeId;
    private Long userId;
    private Long badgeId;
    private String name;
    private String description;
    private String iconUrl;
    private LocalDateTime acquiredAt;
}