package com.runboo.domain.tier.controller;

import com.runboo.domain.tier.dto.UserTierResultResponse;
import com.runboo.domain.tier.service.TierService;
import com.runboo.domain.tier.service.UserTierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class UserTierController {

    private UserTierService userTierService;
    private TierService tierService

    @PostMapping("/tiers/result")
    public ResponseEntity<UserTierResultResponse> saveTierResult(
            @RequestBody UserTierResultResponse request
    ) {

    }
}
