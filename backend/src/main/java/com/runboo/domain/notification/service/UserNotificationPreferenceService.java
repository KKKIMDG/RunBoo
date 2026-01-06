package com.runboo.domain.notification.service;

import com.runboo.domain.notification.dto.NotificationPreferenceRequestDto;
import com.runboo.domain.notification.dto.NotificationPreferenceResponseDto;
import com.runboo.domain.notification.entity.UserNotificationPreference;
import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.repository.UserNotificationPreferenceRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserNotificationPreferenceService {

    private final UserNotificationPreferenceRepository repository;

    /**
     * 알림 설정 조회
     * row 없으면 기본값 처리
     */
    public List<NotificationPreferenceResponseDto> getMyPreferences() {
        Long userId = SecurityUtil.getCurrentUserId();

        Map<NotificationType, Boolean> result = new EnumMap<>(NotificationType.class);

        // 기본값
        result.put(NotificationType.RUN_RESULT, true);
        result.put(NotificationType.CHALLENGE, true);
        result.put(NotificationType.REMINDER, false);
        result.put(NotificationType.EVENT, false);

        // DB 값 덮어쓰기
        repository.findAllByUserId(userId)
                .forEach(p -> result.put(p.getType(), p.isEnabled()));

        return result.entrySet().stream()
                .map(e -> new NotificationPreferenceResponseDto(e.getKey(), e.getValue()))
                .toList();
    }

    /**
     * 알림 설정 저장 (upsert)
     */
    @Transactional
    public void savePreference(NotificationPreferenceRequestDto dto) {
        Long userId = SecurityUtil.getCurrentUserId();

        UserNotificationPreference pref = repository
                .findByUserIdAndType(userId, dto.getType())
                .orElseGet(() ->
                        UserNotificationPreference.of(
                                userId,
                                dto.getType(),
                                dto.getEnabled()
                        )
                );

        pref.updateEnabled(dto.getEnabled());
        repository.save(pref);
    }

    /**
     * 알림 전송 가능 여부 판단
     * push_enabled=false 이면 무조건 스킵
     */
    public boolean canSend(
            boolean pushEnabled,
            NotificationType type
    ) {
        if (!pushEnabled) return false;

        Long userId = SecurityUtil.getCurrentUserId();

        return repository.findByUserIdAndType(userId, type)
                .map(UserNotificationPreference::isEnabled)
                .orElseGet(() -> getDefault(type));
    }

    private boolean getDefault(NotificationType type) {
        return switch (type) {
            case RUN_RESULT, CHALLENGE -> true;
            case REMINDER, EVENT -> false;
        };
    }
}
