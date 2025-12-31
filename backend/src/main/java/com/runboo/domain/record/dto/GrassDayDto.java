package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GrassDayDto {
    private String date;      // "YYYY-MM-DD"
    private double distanceM; // 그 날 총 거리 합
    private int level;        // 0,1,2
}
