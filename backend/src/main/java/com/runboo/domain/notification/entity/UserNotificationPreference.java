package com.runboo.domain.notification.entity;

import com.runboo.domain.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "user_notification_preference",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "type"})
        }
)
@Getter
@NoArgsConstructor
public class UserNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private boolean enabled;

    public static UserNotificationPreference of(
            Long userId,
            NotificationType type,
            boolean enabled
    ) {
        UserNotificationPreference pref = new UserNotificationPreference();
        pref.userId = userId;
        pref.type = type;
        pref.enabled = enabled;
        return pref;
    }

    public void updateEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
