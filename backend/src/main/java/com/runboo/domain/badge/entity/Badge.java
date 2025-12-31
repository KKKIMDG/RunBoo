package com.runboo.domain.badge.entity;

import com.runboo.domain.challenge.entity.Challenge;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "badge_id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "icon_url", columnDefinition = "TEXT")
    private String iconUrl;

    @Column(name = "difficulty")
    private String difficulty;






}
