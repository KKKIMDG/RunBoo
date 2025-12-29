package com.runboo.domain.challenge.dto;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.challenge.entity.Challenge;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class ChallengeDto {

    private int challengeId;

    private int badgeId;       // Badge 엔티티 참조에서 badgeId만 전달
    private String badgeName;  // Badge 이름도 같이 전달 가능
    private String badgeIconUrl; // Badge 아이콘 URL도 필요하면 전달

    private String title;
    private String description;
    private String difficulty;
    private String targetType;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;

    // 엔티티 → DTO 변환용 static 메서드
    public static ChallengeDto fromEntity(Challenge challenge) {
        Badge badge = challenge.getBadge();
        return new ChallengeDto(
                challenge.getChallengeId(),
                badge != null ? badge.getBadgeId() : 0,
                badge != null ? badge.getName() : null,
                badge != null ? badge.getIconUrl() : null,
                challenge.getTitle(),
                challenge.getDescription(),
                challenge.getDifficulty(),
                challenge.getTargetType(),
                challenge.getStartedAt(),
                challenge.getEndedAt()
        );
    }
}