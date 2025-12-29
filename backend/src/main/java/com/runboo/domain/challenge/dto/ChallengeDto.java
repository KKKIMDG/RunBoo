package com.runboo.domain.challenge.dto;

import com.runboo.domain.badge.dto.BadgeDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class ChallengeDto {
    private Long challengeId;
    private String title;
    private String description;
    private String difficulty;
    private String targetType;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;
    private BadgeDto badge;  // BadgeDto로 변환
}