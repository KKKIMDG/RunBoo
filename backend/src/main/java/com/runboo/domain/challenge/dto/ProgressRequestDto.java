package com.runboo.domain.challenge.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProgressRequestDto {
    private String type; // 예: "DISTANCE", "COUNT"
    private int value;   // 예: 500 (500m 추가)
}