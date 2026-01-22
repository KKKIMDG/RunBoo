package com.runboo.domain.notification.repository;

import com.runboo.domain.notification.entity.Notification;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 내 알림 전체 조회 (삭제되지 않은 것만)
     */
    @Query("""
        select n
        from Notification n
        where n.userId = :userId
          and n.deletedAt is null
        order by n.createdAt desc
    """)
    List<Notification> findAllActiveByUserId(Long userId);

    /**
     * 내 미읽음 알림 조회
     */
    @Query("""
        select n
        from Notification n
        where n.userId = :userId
          and n.deletedAt is null
          and n.read = false
        order by n.createdAt desc
    """)
    List<Notification> findUnreadByUserId(Long userId);

    /**
     * 미읽음 알림 개수
     */
    @Query("""
        select count(n)
        from Notification n
        where n.userId = :userId
          and n.deletedAt is null
          and n.read = false
    """)
    long countUnreadByUserId(Long userId);

    /**
     *
     * 전체 읽음 처리
     */
    @Modifying
    @Query("""
        update Notification n
        set n.read = true
        where n.userId = :userId
          and n.deletedAt is null
          and n.read = false
    """)
    int markAllAsRead(Long userId);

    /**
     * 알림 자동 삭제
     */
    @Modifying
    @Query("""
        delete from Notification n
        where n.createdAt < :threshold
    """)
    int deleteOlderThan(@Param("threshold") LocalDateTime threshold);
}
