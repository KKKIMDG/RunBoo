package com.runboo.domain.season.dto;

import com.runboo.domain.season.entity.Season;
import lombok.*;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeasonDto {
    private Long seasonId;
    private String title;
    private String startedAt;
    private String endedAt;
    private Boolean isActive;

    public static SeasonDto from(Season entity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("YYYY-MM-DD HH:mm:ss");
        return SeasonDto.builder()
                .seasonId(entity.getSeasonId())
                .title(entity.getTitle())
                .startedAt(entity.getStartedAt().format(formatter))
                .endedAt(entity.getEndedAt().format(formatter))
                .isActive(entity.getIsActive())
                .build();
    }
}