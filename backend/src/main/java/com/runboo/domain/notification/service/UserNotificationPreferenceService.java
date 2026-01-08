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
     * 내 알림 설정 조회
     *
     * - DB에 row가 없는 알림 타입은 기본값으로 처리
     * - 설정 화면 진입 시 사용
     */
    public List<NotificationPreferenceResponseDto> getMyPreferences() {
        Long userId = SecurityUtil.getCurrentUserId();

        // 알림 타입별 기본값 정의
        Map<NotificationType, Boolean> result = new EnumMap<>(NotificationType.class);
        result.put(NotificationType.RUN_RESULT, true);
        result.put(NotificationType.CHALLENGE, true);
        result.put(NotificationType.REMINDER, false);
        result.put(NotificationType.EVENT, false);

        // 저장된 사용자 설정으로 기본값 덮어쓰기
        repository.findAllByUserId(userId)
                .forEach(p -> result.put(p.getType(), p.isEnabled()));

        return result.entrySet().stream()
                .map(e -> new NotificationPreferenceResponseDto(e.getKey(), e.getValue()))
                .toList();
    }

    /**
     * 단일 알림 설정 저장 (upsert)
     *
     * - 설정 화면에서 토글 변경 시 사용
     * - row 없으면 생성, 있으면 enabled 값만 갱신
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
     * 알림 발송 가능 여부 판단 (Facade 전용)
     *
     * 의미:
     * - "이 유저가 이 타입의 알림을 받겠다고 설정했는가"
     *
     * 주의:
     * - 디바이스 enabled 여부는 여기서 판단하지 않는다
     * - NotificationSendFacade에서 디바이스 필터링과 조합된다
     */
    public boolean isEnabled(Long userId, NotificationType type) {
        return repository.findByUserIdAndType(userId, type)
                .map(UserNotificationPreference::isEnabled)
                .orElseGet(() -> getDefault(type));
    }

    /**
     * 알림 타입별 기본 수신 여부
     *
     * - DB row가 없을 때만 사용
     */
    private boolean getDefault(NotificationType type) {
        return switch (type) {
            case RUN_RESULT, CHALLENGE -> true;
            case REMINDER, EVENT -> false;
        };
    }

    /**
     * 알림 설정 일괄 저장
     *
     * - 설정 화면에서 "저장" 버튼 클릭 시 사용
     */
    @Transactional
    public void savePreferences(List<NotificationPreferenceRequestDto> requests) {
        Long userId = SecurityUtil.getCurrentUserId();

        for (NotificationPreferenceRequestDto req : requests) {
            UserNotificationPreference pref =
                    repository.findByUserIdAndType(userId, req.getType())
                            .orElseGet(() ->
                                    UserNotificationPreference.of(
                                            userId,
                                            req.getType(),
                                            req.getEnabled()
                                    )
                            );

            pref.updateEnabled(req.getEnabled());
            repository.save(pref);
        }
    }
}
