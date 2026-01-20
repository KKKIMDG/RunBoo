package com.runboo.domain.notification.template;

import lombok.Builder;

import java.util.Map;

@Builder
public class NotificationMessageDto {

    private String title;
    private String body;
    private Map<String, String> data; // ← 이거 추가
}