package com.runboo.domain.badge.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userBadgeId;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "badge_id", nullable = false)
    private Long badgeId;

    @Column(name = "icon_url", columnDefinition = "TEXT")
    private String iconUrl;

    @Column(name = "acquired_at", columnDefinition = "TIMESTAMP(0) WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime acquiredAt;


    @PrePersist
    protected void onCreate() {
        if (acquiredAt == null) {
            // 한국 시간 기준으로 초 단위까지만 절삭하여 저장
            acquiredAt = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.SECONDS);
        }
    }
}