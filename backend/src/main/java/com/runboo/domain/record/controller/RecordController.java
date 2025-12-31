package com.runboo.domain.record.controller;

import com.runboo.domain.challenge.service.UserChallengeService;
import com.runboo.domain.record.dto.DashboardStatsDto;
import com.runboo.domain.record.dto.RecordDto;
import com.runboo.domain.record.dto.RunRecordRequestDto;
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

    @PostMapping
    public ResponseEntity<String> createRecord(@AuthenticationPrincipal CustomUserDetails user, @RequestBody RunRecordRequestDto requestDto) {

        String type = "TOTAL_DISTANCE";
        Long userId = requestDto.getUserId();
        recordService.saveRecord(requestDto);
        double value = requestDto.getDistanceM();
        userChallengeService.updateProgress(userId, type, (int) value);
        return ResponseEntity.ok("기록 저장 성공");
    }
}
