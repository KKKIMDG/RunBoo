package com.runboo.domain.badge.entity;

import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "user_badge")
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_badge_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id")
    private Badge badge;

    @Column(name = "acquired_at")
    private OffsetDateTime acquiredAt;

    public UserBadge(User user, Badge badge) {
        this.user = user;
        this.badge = badge;
        this.acquiredAt = OffsetDateTime.now();
    }
}