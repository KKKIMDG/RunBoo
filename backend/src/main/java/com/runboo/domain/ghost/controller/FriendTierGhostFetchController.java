package com.runboo.domain.ghost.controller;

import com.runboo.domain.ghost.dto.FriendTierGhostDto;
import com.runboo.domain.ghost.service.FriendTierGhostFetchService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ghost-profiles")
@RequiredArgsConstructor
public class FriendTierGhostFetchController {

    private final FriendTierGhostFetchService friendTierGhostFetchService;

    /**
     * 친구별 best Tier 고스트
     * - Tier 기록 없는 친구 제외
     * - GhostProfile 없는 친구도 제외
     *
     * GET /api/ghost-profiles/friends/tier-best
     */
    @GetMapping("/friends/tier-best")
    public List<FriendTierGhostDto> getFriendsTierBest(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return friendTierGhostFetchService.getFriendsBestTierGhosts(user.getUserId());
    }
}
