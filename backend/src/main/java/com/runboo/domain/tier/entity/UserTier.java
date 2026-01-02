package com.runboo.domain.tier.entity;

import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_tier")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_tier_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "distance_type", nullable = false)
    private DistanceType distanceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id", nullable = false)
    private Tier tier;

    /* ===== 생성 메서드 ===== */
    public static UserTier create(User user, DistanceType distanceType, Tier tier) {
        UserTier ut = new UserTier();
        ut.user = user;
        ut.distanceType = distanceType;
        ut.tier = tier;
        return ut;
    }

    public enum DistanceType {
        KM_5,
        KM_10
    }

    /* ===== 비즈니스 메서드 ===== */
    public void changeTier(Tier tier) {
        this.tier = tier;
    }
}