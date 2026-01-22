package com.runboo.domain.notification.entity;

import com.runboo.domain.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 100)
    private String title;

    @Column(length = 100)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /* =====================
       생성 메서드
       ===================== */

    public static Notification create(
            Long userId,
            NotificationType type,
            String title,
            String body
    ) {
        Notification notification = new Notification();
        notification.userId = userId;
        notification.type = type;
        notification.title = title;
        notification.body = body;
        notification.read = false;
        notification.createdAt =
                LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        return notification;
    }

    /* =====================
       도메인 행위
       ===================== */

    public void markAsRead() {
        this.read = true;
    }

    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }
}
