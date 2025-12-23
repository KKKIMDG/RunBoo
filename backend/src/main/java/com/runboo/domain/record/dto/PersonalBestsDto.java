package com.runboo.domain.record.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PersonalBestsDto {
    private RecordDto longestDistance;
    private RecordDto longestDuration;
    private RecordDto bestPace;
    private RecordDto mostCalories;
}
