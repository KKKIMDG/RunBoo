package com.runboo.domain.record.dto;

import com.runboo.domain.record.entity.RunRecord;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
public class RecordDetailResponse {
    private Long recordId;
    private Double distance;
    private String time;
    private String pace; // ✅ int에서 String으로 변경하여 "05:30" 형태로 반환
    private LocalDateTime createdAt;

    public RecordDetailResponse(RunRecord record) {
        this.recordId = record.getId();
        this.distance = record.getDistanceM();

        // 1. 러닝 시간 계산 (HH:mm:ss)
        if (record.getStartedAt() != null && record.getEndedAt() != null) {
            Duration duration = Duration.between(record.getStartedAt(), record.getEndedAt());
            long seconds = duration.getSeconds();
            this.time = formatSecondsToTime(seconds);
        } else {
            this.time = "00:00:00";
        }

        // 2. 페이스 계산 (초 단위를 mm'ss" 포맷으로 변환)
        // 예: 330초 -> "05:30"
        int avgPaceSeconds = record.getAvgPace();
        if (avgPaceSeconds > 0) {
            int m = avgPaceSeconds / 60;
            int s = avgPaceSeconds % 60;
            this.pace = String.format("%d'%02d\"", m, s); // 또는 "%d'%02d\"" 포맷 사용 가능
        } else {
            this.pace = "-:--";
        }

        this.createdAt = record.getCreatedAt();
    }

    // 시간 포맷팅 헬퍼 메소드
    private String formatSecondsToTime(long seconds) {
        long h = seconds / 3600;
        long m = (seconds % 3600) / 60;
        long s = seconds % 60;
        return String.format("%02d:%02d:%02d", h, m, s);
    }
}