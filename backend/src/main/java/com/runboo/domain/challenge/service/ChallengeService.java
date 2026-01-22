package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.ChallengeRepository;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
import com.runboo.domain.notification.enums.NotificationType;
import com.runboo.domain.notification.service.NotificationCreateService;
import com.runboo.domain.season.entity.Season;
import com.runboo.domain.season.repository.SeasonRepository;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
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
    private final NotificationCreateService notificationCreateService;
    private final UserRepository userRepository;

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

    // 2. 완료 처리 및 다음 단계 생성 (목표 달성 시 자동 호출)
    @Transactional
    public List<UserChallengeDto> completeAndNextLevel(Long userId) {
        LocalDateTime nowKst = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.SECONDS);

        UserChallenge current = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("진행 중인 챌린지가 없습니다."));

        // 현재 레벨 완료 처리
        current.setStatus("COMPLETED");
        current.setCompletedAt(nowKst);

        // 보상 뱃지 지급
        Badge rewardBadge = current.getChallenge().getBadge();
        if (rewardBadge != null) {
            giveBadgeToUser(userId, rewardBadge.getBadgeId());
        }

        int currentLevel = current.getChallenge().getLevel();
        Season season = current.getChallenge().getSeason();

        // [핵심] 다음 레벨 활성화 및 다다음 레벨 지연 생성
        activateNextLevel(userId, season, currentLevel + 1, nowKst);
        ensureFutureLevelExists(userId, season, currentLevel + 3);

        System.out.println(userId+" : 챌린지 달성!");
        // 챌린지 완료 및 보상 뱃지 지급 알림
        notificationCreateService.create(
                userId,
                NotificationType.CHALLENGE,
                "🎉 챌린지 달성!",
                "챌린지를 완료했어요. 다음 단계가 열렸습니다!"
        );

        return getActiveAndNextChallenges(userId);
    }

    // 다음 레벨(L+1) 상태 변경 (LOCKED -> IN_PROGRESS)
    private void activateNextLevel(Long userId, Season season, int level, LocalDateTime now) {
        userChallengeRepository.findByUserIdAndChallengeLevel(userId, level)
                .ifPresent(next -> {
                    next.setStatus("IN_PROGRESS");
                    next.setStartedAt(now);
                });
    }

    // 미래 레벨(L+3) 존재 여부 확인 후 생성 (마지막 레벨 예외 처리 포함)
    private void ensureFutureLevelExists(Long userId, Season season, int level) {
        // 최대 레벨 상한 체크 (30레벨 초과는 생성하지 않음)
        if (level > 30) return;

        boolean exists = userChallengeRepository.existsByUserIdAndChallengeLevel(userId, level);
        if (!exists) {
            // 마스터 데이터가 실제로 존재할 때만 생성
            challengeRepository.findBySeasonAndLevel(season, level).ifPresent(master -> {
                userChallengeRepository.save(UserChallenge.create(userId, master));
            });
        }
    }

    // 3. 현재 진행 중 1개 + 다음 잠김 2개 조회
    public List<UserChallengeDto> getActiveAndNextChallenges(Long userId) {
        // 진행 중인 챌린지가 없는 경우(전체 완료 등)를 위한 Optional 처리
        Optional<UserChallenge> currentOpt = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS");

        if (currentOpt.isEmpty()) {
            return new ArrayList<>(); // 빈 목록 반환
        }

        UserChallenge current = currentOpt.get();
        int currentLevel = current.getChallenge().getLevel();

        // 현재 레벨부터 최대 3개(현재+다음2개) 조회
        List<UserChallenge> activeList = userChallengeRepository.findActiveAndNextTwo(
                userId, currentLevel, currentLevel + 2);

        return activeList.stream()
                .map(uc -> {
                    Challenge master = uc.getChallenge();
                    Badge badge = master.getBadge();

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
                            .badgeId(badge != null ? badge.getBadgeId() : null)
                            .badgeName(badge != null ? badge.getName() : null)
                            .badgeIconUrl(badge != null ? badge.getIconUrl() : null)
                            .build();
                })
                .toList();
    }

    // 4. 완료된 챌린지 목록 조회 (완료 탭용)
    public List<UserChallengeDto> getCompletedChallenges(Long userId) {
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
                            .title(master.getTitle())
                            .description(master.getDescription())
                            .status(uc.getStatus())
                            .completedAt(uc.getCompletedAt())
                            .badgeId(badge != null ? badge.getBadgeId() : null)
                            .badgeName(badge != null ? badge.getName() : null)
                            .badgeIconUrl(badge != null ? badge.getIconUrl() : null)
                            .build();
                })
                .toList();
    }

    private void giveBadgeToUser(Long userId, Long badgeId) {
        if (!userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)) {
            userBadgeRepository.save(UserBadge.create(userId, badgeId));
        }
    }

    // 진행도 업데이트 및 목표 달성 시 연쇄 호출
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