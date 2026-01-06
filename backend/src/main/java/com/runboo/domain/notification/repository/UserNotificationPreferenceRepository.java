package com.runboo.domain.notification.repository;

import com.runboo.domain.notification.entity.UserNotificationPreference;
import com.runboo.domain.notification.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNotificationPreferenceRepository
        extends JpaRepository<UserNotificationPreference, Long> {

    Optional<UserNotificationPreference> findByUserIdAndType(
            Long userId,
            NotificationType type
    );

    List<UserNotificationPreference> findAllByUserId(Long userId);
}
