package com.runboo.domain.record.entity;


import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "run_records")
public class RunRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String mode;

    @Column(name = "distance_m")
    private Double distanceM;

    @Column(name = "duration_sec")
    private Integer durationSec;

    @Column(name = "avg_pace")
    private Integer avgPace;

    private Integer calories;

    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at", updatable = false)
    private LocalDateTime endedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "route_polyline", columnDefinition = "TEXT")
    private String routePolyLine;

    @lombok.Builder
    public RunRecord(User user, String mode, Double distanceM, Integer durationSec,
                     Integer avgPace, Integer calories, String routePolyLine,
                     LocalDateTime startedAt, LocalDateTime endedAt) {
        this.user = user;
        this.mode = mode;
        this.distanceM = distanceM;
        this.durationSec = durationSec;
        this.avgPace = avgPace;
        this.calories = calories;
        this.routePolyLine = routePolyLine;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }
}
