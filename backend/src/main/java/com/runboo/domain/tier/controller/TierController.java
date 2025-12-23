package com.runboo.domain.tier.controller;

import com.runboo.domain.tier.dto.TierCreateRequest;
import com.runboo.domain.tier.dto.TierResponse;
import com.runboo.domain.tier.entity.Tier;
import com.runboo.domain.tier.service.TierResultService;
import com.runboo.domain.tier.service.TierService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/tier")
public class TierController {

    private final TierResultService tierResultService;
    private final TierService tierService;

    public TierController(TierResultService tierResultService, TierService tierService) {
        this.tierResultService = tierResultService;
        this.tierService = tierService;
    }

    // 특정 러닝 기록으로 티어 계산
    @PostMapping("/evaluate")
    public TierResponse evaluateTier(@RequestBody TierCreateRequest request){
        return tierService.evaluateByRecord(request.getRecordId(), request.getDistanceType());
    }
}
