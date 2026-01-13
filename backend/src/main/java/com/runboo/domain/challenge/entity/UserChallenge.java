package com.runboo.domain.challenge.entity;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor              // ✅ Builder 필수
@Builder                          // ✅ 핵심
@Table(name = "user_challenge")
public class UserChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_challenge_id")
    private Long id;

    /* =========================
       연관관계
       ========================= */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id")
    private Badge badge;

    /* =========================
       진행 정보
       ========================= */
    @Setter
    @Column(name = "progress_value", nullable = false)
    private int progressValue;

    @Setter
    @Column(name = "status", nullable = false)
    private String status; // IN_PROGRESS, COMPLETED

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Setter
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}