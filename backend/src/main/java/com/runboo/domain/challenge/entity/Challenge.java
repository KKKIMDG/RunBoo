package com.runboo.domain.challenge.entity;

import com.runboo.domain.badge.entity.Badge;
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
    @Column(name = "challenge_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id")
    private Badge badge;  // badgeId 대신 Badge 엔티티로 참조

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "target_type")
    private String targetType;

    @Column(name = "target_value")
    private int targetValue;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;
}
