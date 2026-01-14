package com.runboo.domain.ai.controller;

import com.runboo.domain.ai.dto.AiStatusViewResponse;
import com.runboo.domain.ai.dto.AnalysisResponse;
import com.runboo.domain.ai.service.AiAnalysisService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    /**
     * AI 사용 상태 조회 (남은 횟수, 구독 여부, 갱신 남은 일수)
     */
    @GetMapping("/status")
    public ResponseEntity<AiStatusViewResponse> getStatus(@AuthenticationPrincipal CustomUserDetails user) {
        // 서비스에서 미리 정의한 View 전용 메서드 호출
        AiStatusViewResponse response = aiAnalysisService.getStatusForView(user.getUserId());
        return ResponseEntity.ok(response);
    }

    /**
     * AI 분석 실행
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyze(@AuthenticationPrincipal CustomUserDetails user) {
        // 분석 실행 및 결과 반환
        AnalysisResponse response = aiAnalysisService.analyzeRecords(user.getUserId());
        return ResponseEntity.ok(response);
    }
}