package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.ChallengeRepository;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
import com.runboo.domain.season.entity.Season;
import com.runboo.domain.season.repository.SeasonRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final SeasonRepository seasonRepository;

    // 1. 초기 1~3레벨 데이터만 생성
    public void initializeUserChallenges(Long userId) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        Season currentSeason = seasonRepository.findCurrentSeason(now)
                .orElseThrow(() -> new RuntimeException("현재 진행 중인 시즌이 없습니다."));

        // 중복 생성 방지
        if (userChallengeRepository.existsByUserIdAndChallenge_Season(userId, currentSeason)) {
            return;
        }

        // 시즌의 1~3레벨 챌린지만 조회
        List<Challenge> initialMasters = challengeRepository.findBySeasonAndLevelBetween(currentSeason, 1, 3);

        List<UserChallenge> toSave = new ArrayList<>();
        LocalDateTime nowKst = now.truncatedTo(ChronoUnit.SECONDS);

        for (Challenge master : initialMasters) {
            UserChallenge uc = UserChallenge.create(userId, master);
            if (master.getLevel() == 1) {
                uc.setStatus("IN_PROGRESS");
                uc.setStartedAt(nowKst);
            } else {
                uc.setStatus("LOCKED");
            }
            toSave.add(uc);
        }
        userChallengeRepository.saveAll(toSave);
    }

    // 2. 완료 처리 및 다음 단계 유연한 활성화 (추가 생성 로직 포함)
    @Transactional
    public List<UserChallengeDto> completeAndNextLevel(Long userId) {
        LocalDateTime nowKst = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.SECONDS);

        // 현재 진행 중인 챌린지 완료
        UserChallenge current = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("진행 중인 챌린지가 없습니다."));

        current.setStatus("COMPLETED");
        current.setCompletedAt(nowKst);

        // 뱃지 지급
        Long rewardBadgeId = current.getChallenge().getBadgeId();
        if (rewardBadgeId != null) {
            giveBadgeToUser(userId, rewardBadgeId);
        }

        // 다음 레벨(Level + 1) 활성화
        int nextLevel = current.getChallenge().getLevel() + 1;
        activateNextLevel(userId, current.getChallenge().getSeason(), nextLevel, nowKst);

        // 다음다음 레벨(Level + 2) 미리 생성 (항상 2개 앞까지 존재하게 유지)
        ensureFutureLevelExists(userId, current.getChallenge().getSeason(), nextLevel + 1);

        return getActiveAndNextChallenges(userId);
    }

    // 다음 레벨을 찾아 활성화 (LOCKED -> IN_PROGRESS)
    private void activateNextLevel(Long userId, Season season, int level, LocalDateTime now) {
        userChallengeRepository.findByUserIdAndChallengeLevel(userId, level)
                .ifPresent(next -> {
                    next.setStatus("IN_PROGRESS");
                    next.setStartedAt(now);
                });
    }

    // 특정 레벨이 DB에 없으면 새로 생성 (Insert)
    private void ensureFutureLevelExists(Long userId, Season season, int level) {
        if (level > 30) return; // 최대 30레벨 가정

        boolean exists = userChallengeRepository.existsByUserIdAndChallengeLevel(userId, level);
        if (!exists) {
            challengeRepository.findBySeasonAndLevel(season, level).ifPresent(master -> {
                userChallengeRepository.save(UserChallenge.create(userId, master));
            });
        }
    }

    // 3. 현재 1개 + 다음 2개 조회
    public List<UserChallengeDto> getActiveAndNextChallenges(Long userId) {
        UserChallenge current = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("진행 중인 챌린지가 없습니다."));

        List<UserChallenge> activeList = userChallengeRepository.findActiveAndNextTwo(
                userId,
                current.getChallenge().getLevel(),
                current.getChallenge().getLevel() + 2
        );

        return activeList.stream().map(UserChallengeDto::from).toList();
    }

    private void giveBadgeToUser(Long userId, Long badgeId) {
        if (!userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)) {
            userBadgeRepository.save(UserBadge.create(userId, badgeId));
        }
    }

    @Transactional
    public void updateProgress(Long userId, String type, int value) {
        userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS").ifPresent(uc -> {
            if (uc.getChallenge().getTargetType().equals(type)) {
                if (uc.addProgress(value)) {
                    this.completeAndNextLevel(userId);
                }
            }
        });
    }
}