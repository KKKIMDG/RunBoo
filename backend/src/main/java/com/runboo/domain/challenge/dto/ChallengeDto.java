package com.runboo.domain.challenge.dto;

import com.runboo.domain.challenge.entity.Challenge;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeDto {
    private Long challengeId;
    private Long seasonId;
    private Integer level;
    private String title;
    private String description;
    private String targetType;
    private Integer targetValue;
    private Long badgeId;

    public static ChallengeDto from(Challenge entity) {
        return ChallengeDto.builder()
                .challengeId(entity.getChallengeId())
                .seasonId(entity.getSeason().getSeasonId())
                .level(entity.getLevel())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .targetType(entity.getTargetType())
                .targetValue(entity.getTargetValue())
                .badgeId(entity.getBadgeId())
                .build();
    }
}