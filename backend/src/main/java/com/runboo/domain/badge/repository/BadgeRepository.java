package com.runboo.domain.badge.repository;

import com.runboo.domain.badge.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
}
