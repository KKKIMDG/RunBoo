package com.runboo.domain.notification.service;

import com.runboo.domain.notification.dto.NotificationResponseDto;
import com.runboo.domain.notification.repository.NotificationRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationQueryService {

    private final NotificationRepository notificationRepository;

    /**
     * 알림 전체 조회 (삭제 제외, 최신순)
     */
    public List<NotificationResponseDto> getMyNotifications() {
        Long userId = SecurityUtil.getCurrentUserId();

        return notificationRepository.findAllActiveByUserId(userId)
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
     * 미읽음 알림만 조회
     */
    public List<NotificationResponseDto> getMyUnreadNotifications() {
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
     * 미읽음 개수 (뱃지용)
     */
    public long countMyUnread() {
        Long userId = SecurityUtil.getCurrentUserId();
        return notificationRepository.countUnreadByUserId(userId);
    }
}
