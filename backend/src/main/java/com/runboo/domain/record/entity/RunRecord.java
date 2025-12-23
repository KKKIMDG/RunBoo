package com.runboo.domain.record.entity;


import com.runboo.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "run_records")
public class RunRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

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
    private OffsetDateTime startedAt;

    @Column(name = "ended_at", updatable = false)
    private OffsetDateTime endedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "route_polyline", columnDefinition = "TEXT")
    private String routePolyLine;
}
