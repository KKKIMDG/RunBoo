package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class GrassResponseDto {
    private int weeks;
    private String startDate; // "YYYY-MM-DD" (일요일)
    private String endDate;   // "YYYY-MM-DD" (오늘)
    private List<GrassDayDto> days;
}
