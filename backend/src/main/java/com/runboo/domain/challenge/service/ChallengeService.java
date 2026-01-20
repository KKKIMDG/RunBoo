package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.entity.Badge;
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

@Service
@RequiredArgsConstructor
@Transactional
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final SeasonRepository seasonRepository;

    // 1. 초기화 (1~3레벨만 생성)
    public void initializeUserChallenges(Long userId) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        Season currentSeason = seasonRepository.findCurrentSeason(now)
                .orElseThrow(() -> new RuntimeException("현재 진행 중인 시즌이 없습니다."));

        if (userChallengeRepository.existsByUserIdAndChallenge_Season(userId, currentSeason)) {
            return;
        }

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

    // 2. 완료 처리 및 다음 단계 생성
    @Transactional
    public List<UserChallengeDto> completeAndNextLevel(Long userId) {
        LocalDateTime nowKst = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.SECONDS);

        UserChallenge current = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("진행 중인 챌린지가 없습니다."));

        current.setStatus("COMPLETED");
        current.setCompletedAt(nowKst);

        // [수정] Badge 엔티티 연관관계를 통해 ID 추출 및 지급
        Badge rewardBadge = current.getChallenge().getBadge();
        if (rewardBadge != null) {
            giveBadgeToUser(userId, rewardBadge.getBadgeId());
        }

        int nextLevel = current.getChallenge().getLevel() + 1;
        activateNextLevel(userId, current.getChallenge().getSeason(), nextLevel, nowKst);
        ensureFutureLevelExists(userId, current.getChallenge().getSeason(), nextLevel + 1);

        return getActiveAndNextChallenges(userId);
    }

    private void activateNextLevel(Long userId, Season season, int level, LocalDateTime now) {
        userChallengeRepository.findByUserIdAndChallengeLevel(userId, level)
                .ifPresent(next -> {
                    next.setStatus("IN_PROGRESS");
                    next.setStartedAt(now);
                });
    }

    private void ensureFutureLevelExists(Long userId, Season season, int level) {
        if (level > 30) return;
        boolean exists = userChallengeRepository.existsByUserIdAndChallengeLevel(userId, level);
        if (!exists) {
            challengeRepository.findBySeasonAndLevel(season, level).ifPresent(master -> {
                userChallengeRepository.save(UserChallenge.create(userId, master));
            });
        }
    }

    // 3. 현재 1개 + 다음 2개 조회 (마스터 + 뱃지 데이터 결합)
    public List<UserChallengeDto> getActiveAndNextChallenges(Long userId) {
        UserChallenge current = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("진행 중인 챌린지가 없습니다."));

        List<UserChallenge> activeList = userChallengeRepository.findActiveAndNextTwo(
                userId, current.getChallenge().getLevel(), current.getChallenge().getLevel() + 2);

        return activeList.stream()
                .map(uc -> {
                    Challenge master = uc.getChallenge();
                    Badge badge = master.getBadge(); // 마스터와 연결된 뱃지 정보

                    return UserChallengeDto.builder()
                            .userChallengeId(uc.getUserChallengeId())
                            .userId(uc.getUserId())
                            .challengeId(master.getChallengeId())
                            .level(master.getLevel())
                            .title(master.getTitle())
                            .description(master.getDescription())
                            .targetType(master.getTargetType())
                            .targetValue(master.getTargetValue())
                            .status(uc.getStatus())
                            .progressValue(uc.getProgressValue())
                            .startedAt(uc.getStartedAt())
                            .completedAt(uc.getCompletedAt())
                            // [추가] 뱃지 상세 정보 매핑
                            .badgeId(badge != null ? badge.getBadgeId() : null)
                            .badgeName(badge != null ? badge.getName() : null)
                            .badgeIconUrl(badge != null ? badge.getIconUrl() : null)
                            .build();
                })
                .toList();
    }
    // 4. 완료된 챌린지 전체 목록 조회 (완료 페이지용)
    public List<UserChallengeDto> getCompletedChallenges(Long userId) {
        // COMPLETED 상태인 유저 챌린지만 가져오며, 챌린지와 뱃지 정보를 Fetch Join으로 한 번에 조회합니다.
        List<UserChallenge> completedList = userChallengeRepository.findAllByUserIdAndStatusOrderByCompletedAtDesc(userId, "COMPLETED");

        return completedList.stream()
                .map(uc -> {
                    Challenge master = uc.getChallenge();
                    Badge badge = master.getBadge();

                    return UserChallengeDto.builder()
                            .userChallengeId(uc.getUserChallengeId())
                            .userId(uc.getUserId())
                            .challengeId(master.getChallengeId())
                            .level(master.getLevel())
                            .title(master.getTitle()) // 예: "시작이 반이다"
                            .description(master.getDescription()) // 예: "1km를 달려보세요."
                            .status(uc.getStatus()) // "COMPLETED"
                            .completedAt(uc.getCompletedAt()) // 완료 날짜 (UI 표시용)
                            .badgeId(badge != null ? badge.getBadgeId() : null)
                            .badgeName(badge != null ? badge.getName() : "배지")
                            .badgeIconUrl(badge != null ? badge.getIconUrl() : null) // 뱃지 이미지 URL
                            .build();
                })
                .toList();
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