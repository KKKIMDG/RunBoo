package com.runboo.domain.ai.controller;

import com.runboo.domain.ai.dto.AnalysisResponse;
import com.runboo.domain.ai.entity.UserAiStatus;
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

    @GetMapping("/status")
    public ResponseEntity<AnalysisResponse> getStatus(@AuthenticationPrincipal CustomUserDetails user) {

        UserAiStatus status = aiAnalysisService.getStatus(user.getUserId());

        return ResponseEntity.ok(new AnalysisResponse(
                null,
                status.getRemainingCount(),
                status.isSubscribed()
        ));
    }

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyze(@AuthenticationPrincipal CustomUserDetails user) {
        AnalysisResponse response = aiAnalysisService.analyzeRecords(user.getUserId());
        return ResponseEntity.ok(response);
    }
}