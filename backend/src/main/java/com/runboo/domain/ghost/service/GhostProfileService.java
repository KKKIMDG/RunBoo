package com.runboo.domain.ghost.service;

import com.runboo.domain.ghost.dto.GhostProfileCreateRequest;
import com.runboo.domain.ghost.dto.GhostProfileDto;
import com.runboo.domain.ghost.dto.GhostProfileUpdateRequest;
import com.runboo.domain.ghost.entity.GhostProfile;
import com.runboo.domain.ghost.repository.GhostProfileRepository;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GhostProfileService {

    private final GhostProfileRepository ghostProfileRepository;
    private final RunRecordRepository runRecordRepository;
    // 1) 유저 프로필 목록
    public List<GhostProfileDto> getProfiles(Long userId) {
        return ghostProfileRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(GhostProfileDto::new)
                .toList();
    }

    // 2) 프로필 단건 조회
    public GhostProfileDto getProfile(Long userId, Long ghostProfileId) {
        GhostProfile gp = ghostProfileRepository.findById(ghostProfileId)
                .orElseThrow(() -> new IllegalArgumentException("고스트 프로필이 존재하지 않습니다. id=" + ghostProfileId));

        // 소유자 체크 (나중에 인증 붙이면 userId 파라미터 제거 가능)
        if (!gp.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인 고스트 프로필만 조회할 수 있습니다.");
        }

        return new GhostProfileDto(gp);
    }

    // 3) 프로필 생성
    public GhostProfileDto createProfile(GhostProfileCreateRequest req) {
        GhostProfile gp = GhostProfile.create(
                req.getUserId(),
                req.getRunRecordId(),
                req.getType(),
                req.getTargetDistanceKm(),
                req.getAvgPace()
        );

        GhostProfile saved = ghostProfileRepository.save(gp);
        return new GhostProfileDto(saved);
    }

    // 4) 프로필 수정
    public GhostProfileDto updateProfile(Long ghostProfileId, GhostProfileUpdateRequest req) {
        GhostProfile gp = ghostProfileRepository.findById(ghostProfileId)
                .orElseThrow(() -> new IllegalArgumentException("고스트 프로필이 존재하지 않습니다. id=" + ghostProfileId));

        if (!gp.getUserId().equals(req.getUserId())) {
            throw new IllegalArgumentException("본인 고스트 프로필만 수정할 수 있습니다.");
        }

        gp.update(req.getRunRecordId(), req.getType(), req.getTargetDistanceKm(), req.getAvgPace());
        // JPA dirty checking으로 자동 반영
        return new GhostProfileDto(gp);
    }

    // 5) 프로필 삭제
    public void deleteProfile(Long userId, Long ghostProfileId) {
        GhostProfile gp = ghostProfileRepository.findById(ghostProfileId)
                .orElseThrow(() -> new IllegalArgumentException("고스트 프로필이 존재하지 않습니다. id=" + ghostProfileId));

        if (!gp.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인 고스트 프로필만 삭제할 수 있습니다.");
        }

        ghostProfileRepository.delete(gp);
    }

    public GhostProfileDto getTargetUserBest(Long targetUserId) {
        RunRecord bestRecord = runRecordRepository.findTopByUserIdAndAvgPaceGreaterThanOrderByAvgPaceAsc(targetUserId, 0)
                .orElse(null);

        if (bestRecord == null) {
            return null;
        }
        return GhostProfileDto.builder()
                .id(0L)
                .runRecordId(bestRecord.getId())
                .type("TARGET_USER_BEST")
                .targetDistanceKm(bestRecord.getDistanceM() / 1000.0)
                .avgPace(bestRecord.getAvgPace())
                .createdAt(bestRecord.getEndedAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime())
                .build();
    }
}