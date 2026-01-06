package com.runboo.domain.notification.service;

import com.runboo.domain.notification.dto.NotificationResponseDto;
import com.runboo.domain.notification.entity.Notification;
import com.runboo.domain.notification.repository.NotificationRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationReadService {

    private final NotificationRepository notificationRepository;

    /**
     * 읽지 않은 알림만 조회
     */
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getUnreadNotifications() {
        Long userId = SecurityUtil.getCurrentUserId();

        return notificationRepository.findUnreadByUserId(userId)
                .stream()
                .map(n -> new NotificationResponseDto(
                        n.getId(),
                        n.getType(),
                        n.getTitle(),
                        n.getBody(),
                        n.isRead(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    /**
     * 알림 단건 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        Long userId = SecurityUtil.getCurrentUserId();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow();

        // 내 알림 아니면 무시 or 예외
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalStateException("권한 없음");
        }

        notification.markAsRead();
    }

    /**
     * 전체 읽음 처리
     */
    @Transactional
    public void markAllAsRead() {
        Long userId = SecurityUtil.getCurrentUserId();
        notificationRepository.markAllAsRead(userId);
    }
}
