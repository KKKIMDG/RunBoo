package com.runboo.domain.ghost.repository;

import com.runboo.domain.ghost.entity.GhostProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GhostProfileRepository extends JpaRepository<GhostProfile, Long> {

    // 유저의 고스트 프로필 목록
    List<GhostProfile> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 유저의 “최근 프로필 1개” (필요할 때 유용)
    Optional<GhostProfile> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    // runRecordId 여러 개로 고스트 가져오고, 최신순 정렬
    List<GhostProfile> findByRunRecordIdInOrderByCreatedAtDesc(List<Long> runRecordIds);
}
