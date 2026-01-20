package com.runboo.domain.season.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor              // ✅ Builder 필수
@Builder                          // ✅ 핵심
@Table(name = "season")
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "season_id")
    private Long seasonId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TIMESTAMP(0) WITHOUT TIME ZONE")
    private LocalDateTime startedAt;

    @Column(nullable = false, columnDefinition = "TIMESTAMP(0) WITHOUT TIME ZONE")
    private LocalDateTime endedAt;

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isActive = true;
}
