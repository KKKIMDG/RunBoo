package com.runboo.domain.challenge.entity;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.season.entity.Season;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "challenge")
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long challengeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @Column(nullable = false)
    private Integer level; // CHECK (level >= 1 AND level <= 30)

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "target_type", nullable = false)
    private String targetType;

    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @Column(name = "badge_id")
    private Long badgeId; // Badge 엔티티가 있다면 연관관계 매핑 권장
}
