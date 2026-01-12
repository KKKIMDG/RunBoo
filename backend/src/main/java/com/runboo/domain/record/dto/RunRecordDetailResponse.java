package com.runboo.domain.record.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.runboo.domain.record.entity.RunRecord;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RunRecordDetailResponse {

    private Long recordId;
    private String mode;

    private Double distanceM;
    private Integer durationSec;
    private Integer avgPace;
    private Integer calories;
    private Integer cadence;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;

    private String timeText; // "HH:mm:ss"
    private String paceText; // "5'30\""

    // ✅ 프론트에서 routePolyline로 받게 통일
    @JsonProperty("routePolyline")
    private String routePolyLine;

    public RunRecordDetailResponse(RunRecord record) {
        this.recordId = record.getId();
        this.mode = record.getMode();
        this.distanceM = record.getDistanceM();
        this.durationSec = record.getDurationSec();
        this.avgPace = record.getAvgPace();
        this.calories = record.getCalories();
        this.cadence = record.getCadence();
        this.startedAt = record.getStartedAt();
        this.endedAt = record.getEndedAt();
        this.createdAt = record.getCreatedAt();
        this.routePolyLine = record.getRoutePolyLine();
        long sec = calcDurationSec(record);
        this.timeText = formatSecondsToTime(sec);
        this.paceText = formatPaceText(record.getAvgPace());
    }

    private long calcDurationSec(RunRecord r) {
        if (r.getStartedAt() != null && r.getEndedAt() != null) {
            long s = Duration.between(r.getStartedAt(), r.getEndedAt()).getSeconds();
            return Math.max(0, s);
        }
        return r.getDurationSec() == null ? 0 : Math.max(0, r.getDurationSec());
    }

    private String formatSecondsToTime(long seconds) {
        long h = seconds / 3600;
        long m = (seconds % 3600) / 60;
        long s = seconds % 60;
        return String.format("%02d:%02d:%02d", h, m, s);
    }

    private String formatPaceText(Integer avgPaceSeconds) {
        if (avgPaceSeconds == null || avgPaceSeconds <= 0) return "-:--";
        int m = avgPaceSeconds / 60;
        int s = avgPaceSeconds % 60;
        return String.format("%d'%02d\"", m, s);
    }
}
