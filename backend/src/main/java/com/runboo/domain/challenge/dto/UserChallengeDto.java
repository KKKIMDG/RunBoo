package com.runboo.domain.challenge.dto;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserChallengeDto {
    // 1. 유저별 상태 정보 (UserChallenge 테이블)
    private Long userChallengeId;
    private Long userId;
    private Integer progressValue;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long badgeId;
    private String badgeName; // [추가] 뱃지 이름을 담을 필드
    private String badgeIconUrl; // [추가] 뱃지 아이콘 URL

    // 2. 챌린지 상세 정보 (Challenge 테이블에서 가져올 필드들 추가)
    private Long challengeId;
    private String title;         // 챌린지 제목
    private String description;   // 챌린지 설명
    private Integer level;        // 챌린지 레벨
    private String targetType;    // 목표 타입 (DISTANCE 등)
    private Integer targetValue;  // 목표 수치

    // Entity -> DTO 변환 메서드 (마스터 정보 포함)
    public static UserChallengeDto from(UserChallenge entity) {
        Challenge master = entity.getChallenge();
        Badge badge = master.getBadge(); // 마스터 정보에서 뱃지 엔티티 추출
        return UserChallengeDto.builder()
                .userChallengeId(entity.getUserChallengeId())
                .userId(entity.getUserId())
                .progressValue(entity.getProgressValue())
                .status(entity.getStatus())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                // 마스터 정보 추출
                .challengeId(entity.getChallenge().getChallengeId())
                .title(entity.getChallenge().getTitle())
                .description(entity.getChallenge().getDescription())
                .level(entity.getChallenge().getLevel())
                .targetType(entity.getChallenge().getTargetType())
                .targetValue(entity.getChallenge().getTargetValue())
                .badgeId(badge != null ? badge.getBadgeId() : null)
                .badgeName(badge != null ? badge.getName() : "보상 없음") // [추가] 뱃지 이름 매핑
                .badgeIconUrl(badge != null ? badge.getIconUrl() : null)
                .build();
    }
}