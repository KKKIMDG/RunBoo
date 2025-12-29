package com.runboo.domain.challenge.entity;

import com.runboo.domain.badge.entity.Badge;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "challenge")
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_id")
    private Long challengeId;

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

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    // 생성자, 비즈니스 로직 메서드 추가 가능 | 엔티티는 불변성을 가지기 위해 필요시 생성자를 통해 값 초기화 가능하게 함
    public Challenge(String title, String description, String difficulty, String targetType, OffsetDateTime startedAt, OffsetDateTime endedAt) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.targetType = targetType;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }
}
