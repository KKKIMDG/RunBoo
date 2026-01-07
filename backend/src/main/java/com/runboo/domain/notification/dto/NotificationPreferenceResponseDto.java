package com.runboo.domain.notification.dto;

import com.runboo.domain.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationPreferenceResponseDto {

    private NotificationType type;
    private boolean enabled;
}
