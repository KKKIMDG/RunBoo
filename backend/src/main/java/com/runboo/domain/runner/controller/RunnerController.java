package com.runboo.domain.runner.controller;

import com.runboo.domain.runner.dto.LocationRequest;
import com.runboo.domain.runner.dto.RunnerResponse;
import com.runboo.domain.runner.service.RunnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/runners")
@RequiredArgsConstructor
public class RunnerController {
    private final RunnerService runnerService;

    @PostMapping("/nearby")
    public ResponseEntity<List<RunnerResponse>> getNearbyRunners(@AuthenticationPrincipal UserDetails user, @RequestBody LocationRequest request) {
        Long myId = Long.parseLong(user.getUsername());
        List<RunnerResponse> runners = runnerService.updateAndGetNearbyRunners(myId, request);
        return ResponseEntity.ok(runners);
    }
}
