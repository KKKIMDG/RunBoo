package com.runboo.domain.ai.entity;

import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class UserAiStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 남은 무료 사용 횟수
     */
    @Column(nullable = false)
    private int remainingCount;

    /**
     * 프리미엄 구독 여부
     */
    @Column(nullable = false)
    private boolean isSubscribed;

    /**
     * 무료 사용 종료 시점 (remainingCount가 0이 된 시점)
     */
    private LocalDateTime expiredAt;

    /**
     * 다음 무료 사용 갱신 시점 (expiredAt + 30일)
     */
    private LocalDateTime renewAt;

    @Builder
    public UserAiStatus(User user) {
        this.user = user;
        this.remainingCount = 1;
        this.isSubscribed = false;
    }

    /**
     * 무료 이용권 1회 사용
     */
    public void useFreeTicket() {
        if (this.remainingCount <= 0) {
            return;
        }

        this.remainingCount--;

        if (this.remainingCount == 0) {
            LocalDateTime now = LocalDateTime.now();
            this.expiredAt = now;
            this.renewAt = now.plusDays(30);
        }
    }

    /**
     * 갱신 날짜가 도래했을 경우 무료 이용권 재지급
     */
    public void renewIfNeeded() {
        if (this.isSubscribed) {
            return;
        }

        if (this.renewAt == null) {
            return;
        }

        if (!LocalDateTime.now().isBefore(this.renewAt)) {
            this.remainingCount = 1;
            this.expiredAt = null;
            this.renewAt = null;
        }
    }

    /**
     * 프리미엄 구독 활성화
     */
    public void activateSubscription() {
        this.isSubscribed = true;
        this.remainingCount = Integer.MAX_VALUE;
        this.expiredAt = null;
        this.renewAt = null;
    }

    /**
     * 프리미엄 구독 만료
     */
    public void expireSubscription() {
        this.isSubscribed = false;
        this.remainingCount = 1;
    }
}