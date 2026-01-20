package com.runboo.domain.badge.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userBadgeId;

    private Long userId;
    private Long badgeId;

    @Column(columnDefinition = "TIMESTAMP(0) WITH TIME ZONE")
    private LocalDateTime acquiredAt;

    // 서비스에서 사용할 객체 생성 메서드
    public static UserBadge create(Long userId, Long badgeId) {
        UserBadge userBadge = new UserBadge();
        userBadge.userId = userId;
        userBadge.badgeId = badgeId;
        userBadge.acquiredAt = LocalDateTime.now();
        return userBadge;
    }
}