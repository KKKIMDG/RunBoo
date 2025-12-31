package com.runboo.domain.challenge.dto;

import com.runboo.domain.badge.dto.BadgeDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class UserChallengeDto {
    private Long userChallengeId;
    private Long userId;
    private ChallengeDto challenge;
    private int progressValue;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private int percentage;
    private long remainingDays; // 남은 일수
}