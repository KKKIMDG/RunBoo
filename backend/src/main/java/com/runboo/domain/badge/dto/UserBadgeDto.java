package com.runboo.domain.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class UserBadgeDto {
    private Long userBadgeId;    // 엔티티의 id
    private Long userId;         // 연관된 유저의 ID
    private BadgeDto badge;      // 뱃지의 상세 정보 (이미 만들어두신 BadgeDto 활용)
    private OffsetDateTime acquiredAt; // 획득 일시
}