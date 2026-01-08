package com.runboo.domain.notification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(
        name = "user_push_device",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "token"})
        }
)
public class UserPushDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String token;

    @Column(nullable = false)
    private String platform; // ANDROID / IOS

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /* 생성 */
    public static UserPushDevice create(
            Long userId,
            String token,
            String platform
    ) {
        UserPushDevice d = new UserPushDevice();
        d.userId = userId;
        d.token = token;
        d.platform = platform;
        d.enabled = true;
        d.lastSeenAt = LocalDateTime.now();
        d.createdAt = LocalDateTime.now();
        d.updatedAt = LocalDateTime.now();
        return d;
    }

    /* 재활성화 */
    public void touch() {
        this.enabled = true;
        this.lastSeenAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void disable() {
        this.enabled = false;
        this.updatedAt = LocalDateTime.now();
    }
}
