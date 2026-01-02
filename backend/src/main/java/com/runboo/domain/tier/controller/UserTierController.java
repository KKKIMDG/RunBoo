package com.runboo.domain.tier.controller;

import com.runboo.domain.tier.dto.UserTierResponse;
import com.runboo.domain.tier.service.UserTierService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-tier")
public class UserTierController {

    private final UserTierService userTierService;

    @PostMapping("/save")
    public UserTierResponse saveTier(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam Long tierId,
            @RequestParam String distanceType
    ) {
        Long userId = user.getUserId();

        return userTierService.saveUserTier(userId, tierId, distanceType);
    }
}