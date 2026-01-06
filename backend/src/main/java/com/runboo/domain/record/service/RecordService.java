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

    /** 프로필 활동 잔디 (최근 12주) */
    public GrassResponseDto getGrass(Long userId, int weeks) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        // 이번 주 시작(일요일)
        LocalDate thisWeekSunday =
                today.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));

        int w = Math.max(weeks, 1);
        LocalDate startDate = thisWeekSunday.minusWeeks(w - 1);
        LocalDate endDate = today;

        LocalDateTime start = startDate.atStartOfDay(zone).toLocalDateTime();
        LocalDateTime endExclusive = endDate.plusDays(1).atStartOfDay(zone).toLocalDateTime();

        List<Record> records =
                recordRepository.findByUserIdAndStartedAtBetween(userId, start, endExclusive);

        // ✅ LocalDateTime 기준 → toLocalDate()
        Map<LocalDate, Double> distanceByDate = records.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStartedAt().toLocalDate(),
                        Collectors.summingDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0))
                ));

        List<GrassDayDto> days = new ArrayList<>();
        for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
            double dist = distanceByDate.getOrDefault(d, 0.0);

            int level;
            if (dist >= 5000.0) level = 2;
            else if (dist > 0.0) level = 1;
            else level = 0;

            days.add(new GrassDayDto(d.toString(), dist, level));
        }

        return new GrassResponseDto(
                w,
                startDate.toString(),
                endDate.toString(),
                days
        );
    }

    /** 월간 통계 */
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

    /** 주간 통계 */
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

    /** 개인 최고 기록 */
    private PersonalBestsDto getPersonalBests(Long userId) {
        List<Record> all = recordRepository.findByUserIdOrderByStartedAtDesc(userId);

        RecordDto longestDistance = all.stream()
                .max(Comparator.comparingDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0)))
                .map(RecordDto::new)
                .orElse(null);

        RecordDto longestDuration = all.stream()
                .max(Comparator.comparingLong(this::calcDurationSec))
                .map(RecordDto::new)
                .orElse(null);

        RecordDto bestPace = all.stream()
                .filter(r -> r.getDistanceM() != null && r.getDistanceM() > 0)
                .map(r -> {
                    Integer pace = r.getAvgPace();
                    if (pace == null) {
                        long sec = calcDurationSec(r);
                        if (sec <= 0) return null;

                        double km = r.getDistanceM() / 1000.0;
                        if (km <= 0) return null;

                        pace = (int) Math.round(sec / km);
                    }
                    return new AbstractMap.SimpleEntry<>(r, pace);
                })
                .filter(Objects::nonNull)
                .min(Comparator.comparingInt(AbstractMap.SimpleEntry::getValue)) // ✅ int 비교
                .map(e -> new RecordDto(e.getKey()))
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

    /** 실제 러닝 시간 계산 (초) */
    private long calcDurationSec(Record r) {
        if (r.getStartedAt() != null && r.getEndedAt() != null) {
            long sec = Duration.between(r.getStartedAt(), r.getEndedAt()).getSeconds();
            return Math.max(sec, 0);
        }
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

    /** 프로필 - 현재 연속 일수 */
    public int getCurrentRunningStreak(Long userId) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        LocalDate fromDate = today.minusDays(365);

        LocalDateTime start = fromDate.atStartOfDay(zone).toLocalDateTime();
        LocalDateTime endExclusive = today.plusDays(1).atStartOfDay(zone).toLocalDateTime();

        List<Record> records =
                recordRepository.findByUserIdAndStartedAtBetween(userId, start, endExclusive);

        if (records.isEmpty()) return 0;

        Set<LocalDate> runDays = records.stream()
                .map(r -> r.getStartedAt().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate cursor = runDays.contains(today) ? today : today.minusDays(1);

        int streak = 0;
        while (runDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    // 전국 랭킹 TOP5 (mode=TIER, avgPace 빠른 순)
    public List<RecordDto> getNationalRankingTierTop5() {
        return recordRepository
                .findTop5ByModeAndAvgPaceGreaterThanOrderByAvgPaceAsc("TIER", 0)
                .stream()
                .map(RecordDto::new)
                .toList();
    }
}
