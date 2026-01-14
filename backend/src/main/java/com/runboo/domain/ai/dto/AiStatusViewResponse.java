package com.runboo.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AiStatusViewResponse {

    /**
     * 남은 무료 사용 횟수
     */
    private int remainingCount;

    /**
     * 프리미엄 구독 여부
     */
    private boolean isSubscribed;

    /**
     * 무료 사용 소진 시, 초기화까지 남은 일수 (사용 가능 시 null)
     */
    private Long remainingDays;
}