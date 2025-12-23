package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardStatsDto {
    private MonthlySummaryDto monthly;
    private WeeklySummaryDto weekly;
    private PersonalBestsDto personalBests;
}
