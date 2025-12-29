package com.runboo.domain.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BadgeDto {
    private int badgeId;
    private String name;
    private String description;
    private String iconUrl;
    private String difficulty;
}