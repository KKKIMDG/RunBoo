package com.runboo.domain.tier.controller;

import com.runboo.domain.tier.dto.TierCreateRequest;
import com.runboo.domain.tier.dto.TierResponse;
import com.runboo.domain.tier.service.TierService;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/tier")
public class TierController {

    private final TierService tierService;

    // 특정 러닝 기록으로 티어 계산
    @PostMapping("/evaluate")
    public TierResponse evaluateTier(@RequestBody TierCreateRequest request){
        return tierService.evaluateByRecord(request.getRecordId(), request.getDistanceType());
    }
}
