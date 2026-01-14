package com.runboo.domain.ghost.controller;

import com.runboo.domain.ghost.dto.FriendTierBestRunRecordDto;
import com.runboo.domain.ghost.service.FriendTierBestRunRecordService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ghost-profiles")
@RequiredArgsConstructor
public class FriendTierGhostFetchController {

    private final FriendTierBestRunRecordService friendTierBestRunRecordService;

    @GetMapping("/friends/tier-best")
    public List<FriendTierBestRunRecordDto> getFriendsTierBest(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return friendTierBestRunRecordService.getFriendsBestTierRunRecords(user.getUserId());
    }
}
