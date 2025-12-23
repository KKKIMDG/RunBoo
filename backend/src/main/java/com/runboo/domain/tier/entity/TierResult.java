package com.runboo.domain.tier.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Entity
@Table(name = "tier_result")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TierResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_result_id")
    private Long tierResultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id")
    private Record record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id")
    private Tier tier;

    @Column(name = "distance_type")
    private String distanceType;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;
}
