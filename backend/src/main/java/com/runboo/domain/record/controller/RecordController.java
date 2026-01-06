package com.runboo.domain.record.controller;

import com.runboo.domain.challenge.service.UserChallengeService;
import com.runboo.domain.record.dto.DashboardStatsDto;
import com.runboo.domain.record.dto.GrassResponseDto;
import com.runboo.domain.record.dto.RecordDto;
import com.runboo.domain.record.dto.RunRecordRequestDto;
import com.runboo.domain.record.service.AiCoachingService;
import com.runboo.domain.record.service.RecordService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;
    private final UserChallengeService userChallengeService;
    private final AiCoachingService aiCoachingService;

    // 1) 내 기록 조회
    @GetMapping
    public List<RecordDto> getMyRecords(@AuthenticationPrincipal CustomUserDetails user) {
        System.out.println(user.getUserId());
        return recordService.getMyRecords(user.getUserId());
    }

    // 2) 통계 화면 전체(이번달 + 주간 + 개인최고기록)
    @GetMapping("/stats/dashboard")
    public DashboardStatsDto getDashboardStats(@AuthenticationPrincipal CustomUserDetails user) {
        return recordService.getDashboardStats(user.getUserId());
    }

    // 3) 프로필 활동 잔디 (최근 12주)
    @GetMapping("/grass")
    public GrassResponseDto getGrass(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "12") int weeks
    ) {
        return recordService.getGrass(user.getUserId(), weeks);
    }

    // 4) 프로필 - 현재 연속 일수
    @GetMapping("/streak/current")
    public int getCurrentStreak(@AuthenticationPrincipal CustomUserDetails user) {
        return recordService.getCurrentRunningStreak(user.getUserId());
    }

    // 5) 전국 랭킹 TOP5 (TIER만, avgPace 빠른 순)
    @GetMapping("/ranking/national")
    public List<RecordDto> getNationalRankingTierTop5() {
        return recordService.getNationalRankingTierTop5();
    }

    // 6) 누적 총 거리
    @GetMapping("/profile/totalRunDistance")
    public int getTotalRunDistance(@AuthenticationPrincipal CustomUserDetails user) {
        return recordService.getTotalRunDistance(user.getUserId());
    }

    @PostMapping
    public ResponseEntity<String> createRecord(@AuthenticationPrincipal CustomUserDetails user, @RequestBody RunRecordRequestDto requestDto) {

        String type = "TOTAL_DISTANCE";
        Long userId = user.getUserId();
        recordService.saveRecord(requestDto);
        double value = requestDto.getDistanceM();
        userChallengeService.updateProgress(userId, type, (int) value);
        return ResponseEntity.ok("기록 저장 성공");
    }

    @GetMapping("/analysis/monthly")
    public ResponseEntity<String> getMonthlyAnalysis(@AuthenticationPrincipal CustomUserDetails user) {
        String prompt = aiCoachingService.getMonthlyAnalysisPrompt(user.getUserId());

        if (prompt == null) {
            return ResponseEntity.ok("아직 이번 달 달리기 기록이 없네요! 🏃‍♂️ 운동화를 신고 첫 기록을 만들어보세요!");
        }

        String analysisResult = aiCoachingService.analyze(prompt);

        return ResponseEntity.ok(analysisResult);
    }
}
