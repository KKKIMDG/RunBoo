package com.runboo.domain.record.service;

import com.runboo.domain.record.dto.*;
import com.runboo.domain.record.entity.Record;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RecordRepository;
import com.runboo.domain.record.repository.RunRecordRepository;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;
    private final UserRepository userRepository;
    private final RunRecordRepository runRecordRepository;

    public List<RecordDto> getMyRecords(Long userId) {
        return recordRepository.findByUserIdOrderByStartedAtDesc(userId)
                .stream()
                .map(RecordDto::new)
                .toList();
    }

    public DashboardStatsDto getDashboardStats(Long userId) {
        MonthlySummaryDto monthly = getThisMonthSummary(userId);
        WeeklySummaryDto weekly = getThisWeekSummary(userId);
        PersonalBestsDto personalBests = getPersonalBests(userId);

        return new DashboardStatsDto(monthly, weekly, personalBests);
    }

    /* =========================
       월간 통계
     ========================= */
    private MonthlySummaryDto getThisMonthSummary(Long userId) {
        ZoneId zone = ZoneId.systemDefault();

        LocalDate today = LocalDate.now(zone);
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1);

        LocalDateTime start = monthStart.atStartOfDay(zone).toLocalDateTime();
        LocalDateTime end = monthEnd.atStartOfDay(zone).toLocalDateTime();
        List<Record> records =
                recordRepository.findByUserIdAndStartedAtBetween(userId, start, end);

        long totalRuns = records.size();

        double totalDistanceM = records.stream()
                .mapToDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0))
                .sum();

        // ✅ startedAt ~ endedAt 기준
        long totalDurationSec = records.stream()
                .mapToLong(this::calcDurationSec)
                .sum();

        long totalCalories = records.stream()
                .mapToLong(r -> Optional.ofNullable(r.getCalories()).orElse(0))
                .sum();

        return new MonthlySummaryDto(
                totalRuns,
                totalDistanceM,
                totalDurationSec,
                totalCalories
        );
    }

    /* =========================
       주간 통계
     ========================= */
    private WeeklySummaryDto getThisWeekSummary(Long userId) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate nextMonday = monday.plusWeeks(1);

        LocalDateTime start = monday.atStartOfDay(zone).toLocalDateTime();
        LocalDateTime end = nextMonday.atStartOfDay(zone).toLocalDateTime();

        List<Record> records =
                recordRepository.findByUserIdAndStartedAtBetween(userId, start, end);

        Map<LocalDate, List<Record>> grouped =
                records.stream()
                        .collect(Collectors.groupingBy(
                                r -> r.getStartedAt().toLocalDate()
                        ));

        List<WeeklyItemDto> items = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            List<Record> dayRecords = grouped.getOrDefault(date, List.of());

            long runs = dayRecords.size();

            double distanceM = dayRecords.stream()
                    .mapToDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0))
                    .sum();

            // ✅ startedAt ~ endedAt 기준
            long durationSec = dayRecords.stream()
                    .mapToLong(this::calcDurationSec)
                    .sum();

            long calories = dayRecords.stream()
                    .mapToLong(r -> Optional.ofNullable(r.getCalories()).orElse(0))
                    .sum();

            items.add(new WeeklyItemDto(
                    date,
                    runs,
                    distanceM,
                    durationSec,
                    calories
            ));
        }

        return new WeeklySummaryDto(items);
    }

    /* =========================
       개인 최고 기록
       ✅ longestDuration는 실제 시간(ended-start)로 재계산해서 Top1 선정
     ========================= */
    private PersonalBestsDto getPersonalBests(Long userId) {
        // 개인 최고는 기간 제한 없이 전체 기록 기준
        List<Record> all = recordRepository.findByUserIdOrderByStartedAtDesc(userId);

        RecordDto longestDistance = all.stream()
                .max(Comparator.comparingDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0)))
                .map(RecordDto::new)
                .orElse(null);

        // 🔥 핵심: durationSec가 아니라 startedAt~endedAt으로 비교
        RecordDto longestDuration = all.stream()
                .max(Comparator.comparingLong(this::calcDurationSec))
                .map(RecordDto::new)
                .orElse(null);

        RecordDto bestPace = all.stream()
                .filter(r -> r.getAvgPace() != null)
                .min(Comparator.comparingDouble(Record::getAvgPace))
                .map(RecordDto::new)
                .orElse(null);

        RecordDto mostCalories = all.stream()
                .max(Comparator.comparingLong(r -> Optional.ofNullable(r.getCalories()).orElse(0)))
                .map(RecordDto::new)
                .orElse(null);

        return new PersonalBestsDto(
                longestDistance,
                longestDuration,
                bestPace,
                mostCalories
        );
    }

    /* =========================
       실제 러닝 시간 계산 (초)
       startedAt ~ endedAt 기준
     ========================= */
    private long calcDurationSec(Record r) {
        if (r.getStartedAt() != null && r.getEndedAt() != null) {
            long sec = Duration.between(r.getStartedAt(), r.getEndedAt()).getSeconds();
            return Math.max(sec, 0);
        }
        // fallback
        return Optional.ofNullable(r.getDurationSec()).orElse(0);
    }
    @Transactional
    public void saveRecord(RunRecordRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("유저가 없습니다."));

        RunRecord runRecord = RunRecord.builder()
                .user(user)
                .mode(dto.getMode())
                .distanceM(dto.getDistanceM())
                .durationSec(dto.getDurationSec())
                .avgPace(dto.getAvgPace())
                .calories(dto.getCalories())
                .routePolyLine(dto.getRoutePolyline())
                .startedAt(dto.getStartedAt())
                .endedAt(dto.getEndedAt())
                .build();

        runRecordRepository.save(runRecord);
    }
}
