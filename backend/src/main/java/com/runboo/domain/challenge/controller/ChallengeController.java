package com.runboo.domain.challenge.controller;

import com.runboo.domain.challenge.dto.ProgressRequestDto;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.dto.UserChallengeRequestDto;
import com.runboo.domain.challenge.service.ChallengeService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    /**
     * 1. 챌린지 초기화 (시즌 첫 참여 시 30개 생성)
     * DTO에는 seasonId만 담아서 보내면 userId는 인증 정보에서 추출합니다.
     */
    @PostMapping("/initialize")
    public ResponseEntity<String> initializeChallenges(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody UserChallengeRequestDto requestDto) {

        // DTO에 인증된 유저의 ID를 강제로 주입하여 보안 강화
        requestDto.setUserId(user.getUserId());
        challengeService.initializeUserChallenges(requestDto);

        return ResponseEntity.ok("챌린지 30단계가 성공적으로 생성되었습니다.");
    }

    /**
     * 2. 현재 활성화된 챌린지 조회 (진행 중 1개 + 다음 2개)
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserChallengeDto>> getActiveChallenges(
            @AuthenticationPrincipal CustomUserDetails user) {

        List<UserChallengeDto> activeChallenges = challengeService.getActiveAndNextChallenges(user.getUserId());
        return ResponseEntity.ok(activeChallenges);
    }

    /**
     * 3. 진행도 업데이트 및 자동 완료 처리
     * 러닝 데이터를 전송하면 타입이 맞을 경우 진행도를 올리고, 100% 도달 시 다음 레벨을 오픈합니다.
     */
    @PatchMapping("/progress")
    public ResponseEntity<List<UserChallengeDto>> updateProgress(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody ProgressRequestDto requestDto) {

        // 진행도 갱신 실행
        challengeService.updateProgress(user.getUserId(), requestDto.getType(), requestDto.getValue());

        // 갱신 후의 최신 상태(3개)를 바로 반환하여 화면 동기화
        List<UserChallengeDto> updatedList = challengeService.getActiveAndNextChallenges(user.getUserId());
        return ResponseEntity.ok(updatedList);
    }
}