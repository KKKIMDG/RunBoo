package com.runboo.domain.tier.controller;

import com.runboo.domain.tier.dto.UserTierResponse;
import com.runboo.domain.tier.service.UserTierService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/")
    public List<Long> getUserTiers(@AuthenticationPrincipal CustomUserDetails user) {
        Long userId = user.getUserId();
        return userTierService.getUserTierIds(userId);
    }
}
