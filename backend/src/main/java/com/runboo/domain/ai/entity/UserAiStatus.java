package com.runboo.domain.ai.entity;


import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class UserAiStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int remainingCount;

    private boolean isSubscribed;

    @Builder
    public UserAiStatus(User user) {
        this.user = user;
        this.remainingCount = 1;
        this.isSubscribed = false;
    }

    public void useFreeTicket() {
        if (this.remainingCount > 0) {
            this.remainingCount--;
        }
    }

    public void activateSubscription() {
        this.isSubscribed = true;
    }

    public void expireSubscription() {
        this.isSubscribed = false;
    }
}
