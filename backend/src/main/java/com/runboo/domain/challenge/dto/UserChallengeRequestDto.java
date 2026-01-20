package com.runboo.domain.challenge.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserChallengeRequestDto {
    private Long userId;
    private Long seasonId;
}