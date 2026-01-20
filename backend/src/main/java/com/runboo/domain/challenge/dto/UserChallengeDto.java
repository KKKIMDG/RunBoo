package com.runboo.domain.challenge.dto;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.challenge.entity.UserChallenge;
import lombok.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserChallengeDto {
    private Long userChallengeId;
    private Long userId;
    private Long challengeId;
    private Integer progressValue;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public static UserChallengeDto from(UserChallenge entity) {
        return UserChallengeDto.builder()
                .userChallengeId(entity.getUserChallengeId())
                .userId(entity.getUserId())
                .challengeId(entity.getChallenge().getChallengeId())
                .progressValue(entity.getProgressValue())
                .status(entity.getStatus())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .build();
    }
}