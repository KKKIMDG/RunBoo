package com.runboo.domain.badge.repository;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    // 중복 획득 방지를 위해 존재 여부 확인 메서드
    boolean existsByUserAndBadge(User user, Badge badge);
    List<UserBadge> findAllByUserId(Long userId);
}
