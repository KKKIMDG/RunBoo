package com.runboo.domain.record.service;

import com.runboo.domain.record.dto.*;
import com.runboo.domain.record.entity.Record;
import com.runboo.domain.record.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;

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

    private MonthlySummaryDto getThisMonthSummary(Long userId) {
        ZoneId zone = ZoneId.systemDefault();

        LocalDate today = LocalDate.now(zone);
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.plusMonths(1);

        OffsetDateTime start = monthStart.atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime end = monthEnd.atStartOfDay(zone).toOffsetDateTime();

        List<Record> records =
                recordRepository.findByUserIdAndStartedAtBetween(userId, start, end);

        long totalRuns = records.size();
        double totalDistanceM = records.stream()
                .mapToDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0))
                .sum();
        long totalDurationSec = records.stream()
                .mapToLong(r -> Optional.ofNullable(r.getDurationSec()).orElse(0))
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

    private WeeklySummaryDto getThisWeekSummary(Long userId) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        LocalDate monday = today.with(DayOfWeek.MONDAY);
        LocalDate nextMonday = monday.plusWeeks(1);

        OffsetDateTime start = monday.atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime end = nextMonday.atStartOfDay(zone).toOffsetDateTime();

        List<Record> records =
                recordRepository.findByUserIdAndStartedAtBetween(userId, start, end);

        // 날짜별 그룹핑
        Map<LocalDate, List<Record>> grouped =
                records.stream()
                        .collect(Collectors.groupingBy(
                                r -> r.getStartedAt().toLocalDate()
                        ));

        List<WeeklyItemDto> items = new ArrayList<>();

        // 월~일 7일 고정
        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            List<Record> dayRecords = grouped.getOrDefault(date, List.of());

            long runs = dayRecords.size();
            double distanceM = dayRecords.stream()
                    .mapToDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0))
                    .sum();
            long durationSec = dayRecords.stream()
                    .mapToLong(r -> Optional.ofNullable(r.getDurationSec()).orElse(0))
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

    private PersonalBestsDto getPersonalBests(Long userId) {
        RecordDto longestDistance =
                recordRepository.findTopByUserIdOrderByDistanceMDesc(userId)
                        .map(RecordDto::new)
                        .orElse(null);

        RecordDto longestDuration =
                recordRepository.findTopByUserIdOrderByDurationSecDesc(userId)
                        .map(RecordDto::new)
                        .orElse(null);

        RecordDto bestPace =
                recordRepository.findTopByUserIdOrderByAvgPaceAsc(userId)
                        .map(RecordDto::new)
                        .orElse(null);

        RecordDto mostCalories =
                recordRepository.findTopByUserIdOrderByCaloriesDesc(userId)
                        .map(RecordDto::new)
                        .orElse(null);

        return new PersonalBestsDto(
                longestDistance,
                longestDuration,
                bestPace,
                mostCalories
        );
    }
}
