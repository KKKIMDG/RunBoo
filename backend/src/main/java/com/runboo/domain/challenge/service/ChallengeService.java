package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.dto.UserChallengeRequestDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.ChallengeRepository;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
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

    // 1. 초기 30개 데이터 생성
    public void initializeUserChallenges(UserChallengeRequestDto requestDto) {
        Long userId = requestDto.getUserId();
        Long seasonId = requestDto.getSeasonId();

        List<Challenge> seasonChallenges = challengeRepository.findBySeason_SeasonIdOrderByLevelAsc(seasonId);

        if (seasonChallenges.isEmpty()) {
            throw new RuntimeException("해당 시즌에 등록된 챌린지가 없습니다.");
        }

        List<UserChallenge> userChallengeList = new ArrayList<>();
        LocalDateTime nowKst = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.SECONDS);

        for (Challenge challenge : seasonChallenges) {
            UserChallenge userChallenge = UserChallenge.create(userId, challenge);

            if (challenge.getLevel() == 1) {
                userChallenge.setStatus("IN_PROGRESS");
                userChallenge.setStartedAt(nowKst);
            } else {
                userChallenge.setStatus("LOCKED");
            }
            userChallengeList.add(userChallenge);
        }
        userChallengeRepository.saveAll(userChallengeList);
    }

    // 2. 완료 및 다음 단계 활성화
    @Transactional
    public List<UserChallengeDto> completeAndNextLevel(Long userId) {
        LocalDateTime nowKst = LocalDateTime.now(ZoneId.of("Asia/Seoul")).truncatedTo(ChronoUnit.SECONDS);

        // 현재 진행 중인 챌린지 처리 (orElseThrow 람다)
        UserChallenge current = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .orElseThrow(() -> new RuntimeException("진행 중인 챌린지가 없습니다."));

        // 현재 단계 완료
        current.setStatus("COMPLETED");
        current.setCompletedAt(nowKst);

        // 뱃지 지급 (Optional.ofNullable 활용 가능하나 명시적 if 선호)
        Long rewardBadgeId = current.getChallenge().getBadgeId();
        if (rewardBadgeId != null) {
            giveBadgeToUser(userId, rewardBadgeId);
        }

        // 다음 레벨 활성화 (ifPresent 람다)
        int nextLevel = current.getChallenge().getLevel() + 1;
        userChallengeRepository.findByUserIdAndChallengeLevel(userId, nextLevel)
                .ifPresent(next -> {
                    next.setStatus("IN_PROGRESS");
                    next.setStartedAt(nowKst);
                });

        return getActiveAndNextChallenges(userId);
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

        List<UserChallengeDto> dtoList = new ArrayList<>();
        // 조회된 리스트를 DTO로 변환
        activeList.forEach(entity -> dtoList.add(UserChallengeDto.from(entity)));

        return dtoList;
    }

    private void giveBadgeToUser(Long userId, Long badgeId) {
        if (!userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)) {
            userBadgeRepository.save(UserBadge.create(userId, badgeId));
        }
    }

    @Transactional
    public void updateProgress(Long userId, String type, int value) {
        // 1. 진행 중인 챌린지 하나를 가져옵니다. (한 번에 하나만 진행한다고 가정)
        Optional<UserChallenge> ongoingOpt = userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS");

        // 2. 진행 중인 것이 있을 때만 로직 실행
        if (ongoingOpt.isPresent()) {
            UserChallenge uc = ongoingOpt.get();

            // 3. 타입이 일치하는지 확인 (예: DISTANCE, COUNT 등)
            if (uc.getChallenge().getTargetType().equals(type)) {

                // 4. 진행도 추가 및 완료 여부 확인 (엔티티 내부 addProgress 메서드 활용)
                boolean isCompleted = uc.addProgress(value);

                // 5. 완료되었다면 기존에 만든 완료 로직 실행 (뱃지 지급, 다음 레벨 활성화 포함)
                if (isCompleted) {
                    this.completeAndNextLevel(userId);
                }
            }
        }
    }
}