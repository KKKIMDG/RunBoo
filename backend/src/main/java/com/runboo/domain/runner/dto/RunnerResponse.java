package com.runboo.domain.runner.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RunnerResponse {
    private Long userId;
    private String nickname;
    private double latitude;
    private double longitude;
    private String profileImageUrl;
}
