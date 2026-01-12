package com.runboo.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalysisResponse {
    private String markdownContent;
    private int remainingCount;
    private boolean isSubscribed;
}
