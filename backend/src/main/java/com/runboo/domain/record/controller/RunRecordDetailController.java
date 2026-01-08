package com.runboo.domain.record.controller;

import com.runboo.domain.record.dto.RunRecordDetailResponse;
import com.runboo.domain.record.service.RunRecordDetailService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/run-records")
@RequiredArgsConstructor
public class RunRecordDetailController {

    private final RunRecordDetailService runRecordDetailService;

    // ✅ 신규: 기록 상세 (경로 포함)
    @GetMapping("/{recordId}")
    public ResponseEntity<RunRecordDetailResponse> getRunRecordDetail(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long recordId
    ) {
        return ResponseEntity.ok(runRecordDetailService.getDetail(user.getUserId(), recordId));
    }
}
