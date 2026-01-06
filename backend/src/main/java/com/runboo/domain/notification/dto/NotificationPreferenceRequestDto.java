package com.runboo.domain.notification.dto;

import com.runboo.domain.notification.enums.NotificationType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class NotificationPreferenceRequestDto {

    @NotNull
    private NotificationType type;

    @NotNull
    private Boolean enabled;
}
