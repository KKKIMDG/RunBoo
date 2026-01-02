package com.runboo.domain.runner.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LocationRequest {
    private double latitude;
    private double longitude;
    private double radius = 3.0;
}
