package com.runboo.domain.notification.dto;

import com.runboo.domain.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponseDto {

    private Long id;
    private NotificationType type;
    private String title;
    private String body;
    private boolean read;
    private LocalDateTime createdAt;
}
