package com.runboo.domain.tier.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tier")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_id")
    private Long tierId;

    @Column(name = "name")
    private String name;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "distance_type")
    private String distanceType;

    @Column(name = "min_pace_sec_per_km")
    private int minPaceSecPerKm;

    @Column(name = "max_pace_sec_per_km")
    private int maxPaceSecPerKm;

}
