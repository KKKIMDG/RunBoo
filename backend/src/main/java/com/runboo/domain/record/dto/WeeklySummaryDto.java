package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class WeeklySummaryDto {
    private List<WeeklyItemDto> items;
}
