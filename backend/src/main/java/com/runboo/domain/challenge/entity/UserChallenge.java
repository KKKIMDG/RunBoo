package com.runboo.domain.challenge.entity;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor              // ✅ Builder 필수
@Builder                          // ✅ 핵심
@Table(name = "user_challenge")
public class UserChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userChallengeId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer progressValue = 0;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'LOCKED'")
    private String status = "LOCKED";

    @Column(columnDefinition = "TIMESTAMP(0) WITHOUT TIME ZONE")
    private LocalDateTime startedAt;

    @Column(columnDefinition = "TIMESTAMP(0) WITHOUT TIME ZONE")
    private LocalDateTime completedAt;

    public static UserChallenge create(Long userId, Challenge challenge) {
        UserChallenge userChallenge = new UserChallenge();

        // 외래 키 및 기본 정보 설정
        userChallenge.userId = userId;
        userChallenge.challenge = challenge;

        // 초기 상태값 설정
        userChallenge.progressValue = 0;
        userChallenge.status = "LOCKED"; // 기본은 잠금, 서비스에서 1레벨만 활성화 처리

        return userChallenge;
    }

    public boolean addProgress(int value) {
        int target = this.challenge.getTargetValue();
        this.progressValue = Math.min(this.progressValue + value, target);
        return this.progressValue >= target;
    }
}