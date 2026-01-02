package com.runboo.domain.runner.controller;

import com.runboo.domain.runner.dto.LocationRequest;
import com.runboo.domain.runner.dto.RunnerResponse;
import com.runboo.domain.runner.service.RunnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> getNearbyRunners(@AuthenticationPrincipal UserDetails user, @RequestBody LocationRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        String email = user.getUsername();

        List<RunnerResponse> runners = runnerService.updateAndGetNearbyRunners(email, request);

        return ResponseEntity.ok(runners);
    }
}