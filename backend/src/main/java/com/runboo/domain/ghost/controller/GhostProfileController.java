package com.runboo.domain.ghost.controller;

import com.runboo.domain.ghost.dto.GhostProfileCreateRequest;
import com.runboo.domain.ghost.dto.GhostProfileDto;
import com.runboo.domain.ghost.dto.GhostProfileUpdateRequest;
import com.runboo.domain.ghost.service.GhostProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ghost-profiles")
@RequiredArgsConstructor
public class GhostProfileController {

    private final GhostProfileService ghostProfileService;

    // 유저 고스트 프로필 목록
    @GetMapping
    public List<GhostProfileDto> getProfiles(@RequestParam Long userId) {
        return ghostProfileService.getProfiles(userId);
    }

    // 고스트 프로필 단건
    @GetMapping("/{ghostProfileId}")
    public GhostProfileDto getProfile(@RequestParam Long userId, @PathVariable Long ghostProfileId) {
        return ghostProfileService.getProfile(userId, ghostProfileId);
    }

    // 고스트 프로필 생성
    @PostMapping
    public GhostProfileDto createProfile(@RequestBody GhostProfileCreateRequest req) {
        return ghostProfileService.createProfile(req);
    }

    // 고스트 프로필 수정
    @PutMapping("/{ghostProfileId}")
    public GhostProfileDto updateProfile(@PathVariable Long ghostProfileId, @RequestBody GhostProfileUpdateRequest req) {
        return ghostProfileService.updateProfile(ghostProfileId, req);
    }

    // 고스트 프로필 삭제
    @DeleteMapping("/{ghostProfileId}")
    public void deleteProfile(@RequestParam Long userId, @PathVariable Long ghostProfileId) {
        ghostProfileService.deleteProfile(userId, ghostProfileId);
    }
}
