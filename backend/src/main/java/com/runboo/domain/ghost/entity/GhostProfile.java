package com.runboo.domain.ghost.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ghost_profile")
public class GhostProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ghost_profile_id")
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    // run_records의 record_id를 참조한다고 보면 됨 (FK로 걸려있든 아니든 Long으로 매핑 가능)
    @Column(name = "run_record_id")
    private Long runRecordId;

    @Column(name = "type", length = 20)
    private String type;

    @Column(name = "target_distance_km")
    private Double targetDistanceKm; // DECIMAL(10,2) -> Double로 매핑

    @Column(name = "avg_pace")
    private Integer avgPace;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    // 생성/수정은 엔티티 내부 메서드로 제한 (Setter 안 쓰는 스타일)
    public static GhostProfile create(Long userId, Long runRecordId, String type, Double targetDistanceKm, Integer avgPace) {
        GhostProfile gp = new GhostProfile();
        gp.userId = userId;
        gp.runRecordId = runRecordId;
        gp.type = type;
        gp.targetDistanceKm = targetDistanceKm;
        gp.avgPace = avgPace;
        gp.createdAt = OffsetDateTime.now();
        return gp;
    }

    public void update(Long runRecordId, String type, Double targetDistanceKm, Integer avgPace) {
        this.runRecordId = runRecordId;
        this.type = type;
        this.targetDistanceKm = targetDistanceKm;
        this.avgPace = avgPace;
        // createdAt은 생성 시각이니까 보통 update에서 안 건드림
    }
}
