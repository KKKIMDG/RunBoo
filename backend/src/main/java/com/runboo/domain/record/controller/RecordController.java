package com.runboo.domain.record.controller;

import com.runboo.domain.record.dto.DashboardStatsDto;
import com.runboo.domain.record.dto.RecordDto;
import com.runboo.domain.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    // 1) 내 기록 조회
    @GetMapping
    public List<RecordDto> getMyRecords(@RequestParam Long userId) {
        return recordService.getMyRecords(userId);
    }

    // 2) 통계 화면 전체(이번달 + 주간 + 개인최고기록)
    @GetMapping("/stats/dashboard")
    public DashboardStatsDto getDashboardStats(@RequestParam Long userId) {
        return recordService.getDashboardStats(userId);
    }
}
