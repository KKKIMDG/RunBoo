package com.runboo.domain.record.service;

import com.runboo.domain.record.entity.Record;
import com.runboo.domain.record.repository.RecordRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AiCoachingService {

    private final RecordRepository recordRepository;
    private final ChatClient chatClient; //

    public AiCoachingService(RecordRepository recordRepository, ChatClient.Builder builder) {
        this.recordRepository = recordRepository;
        this.chatClient = builder.build();
    }

    public String getMonthlyAnalysisPrompt(Long userId) {
        ZoneId zone = ZoneId.systemDefault();
        YearMonth thisMonth = YearMonth.now(zone);

        LocalDateTime start = thisMonth.atDay(1).atStartOfDay();
        LocalDateTime end = thisMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Record> records = recordRepository.findByUserIdAndStartedAtBetween(userId, start, end);

        if (records.isEmpty()) {
            return null;
        }

        double totalDistanceKm = records.stream()
                .mapToDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0))
                .sum() / 1000.0;

        int totalRuns = records.size();

        double avgPaceSeconds = records.stream()
                .mapToInt(r -> Optional.ofNullable(r.getAvgPace()).orElse(0))
                .filter(pace -> pace > 0)
                .average()
                .orElse(0.0);

        String formattedAvgPace = formatPace((int) avgPaceSeconds);

        Record bestRun = records.stream()
                .max(Comparator.comparingDouble(r -> Optional.ofNullable(r.getDistanceM()).orElse(0.0)))
                .orElse(records.get(0));

        String bestRunInfo = String.format("날짜: %s, 거리: %.2fkm, 페이스: %s",
                bestRun.getStartedAt().toLocalDate(),
                bestRun.getDistanceM() / 1000.0,
                formatPace(bestRun.getAvgPace()));

        return String.format("""
                [월간 러닝 데이터 분석 요청]
                당신은 러닝 전문 코치 'RunBoo'입니다. 아래는 사용자의 이번 달(%d월) 러닝 통계입니다.
                
                - 총 달린 거리: %.2f km
                - 총 러닝 횟수: %d 회
                - 이번 달 평균 페이스: %s (분/km)
                - 이번 달 최고의 기록: [%s]
                
                위 데이터를 바탕으로:
                1. 이번 달의 성과를 한 줄로 요약해서 칭찬해주세요.
                2. 평균 페이스와 총 거리를 분석하여 다음 달의 구체적인 목표(거리 또는 페이스)를 추천해주세요.
                3. 말투는 친절하고 동기부여가 되게 해주세요. (300자 이내)
                """,
                thisMonth.getMonthValue(),
                totalDistanceKm,
                totalRuns,
                formattedAvgPace,
                bestRunInfo
        );
    }

    public String analyze(String promptMessage) {
        return chatClient.prompt()
                .user(promptMessage)
                .call()
                .content();
    }

    private String formatPace(Integer paceSeconds) {
        if (paceSeconds == null || paceSeconds == 0) return "0'00''";
        int minutes = paceSeconds / 60;
        int seconds = paceSeconds % 60;
        return String.format("%d'%02d''", minutes, seconds);
    }
}