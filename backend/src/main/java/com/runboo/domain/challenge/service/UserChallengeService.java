package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.BadgeRepository;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import com.runboo.domain.challenge.dto.ChallengeDto;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.ChallengeRepository;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
import com.runboo.domain.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserChallengeService {

    private final UserChallengeRepository userChallengeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ChallengeRepository challengeRepository;
    private final BadgeRepository badgeRepository; // ✅ 뱃지 전용 레포지토리 추가

    // 도전과제 조회 서비스
    public List<UserChallengeDto> getUserChallengeListByStatus(Long userId, String status){
//        // [로그] 입력값 확인
//        System.out.println(">>> 서비스 호출됨 - userId: " + userId + ", status: " + status);
        List<UserChallenge> entities = userChallengeRepository.findAllByUserIdAndStatus(userId, status);
        List<UserChallengeDto> dtos = new ArrayList<>();


//        // [로그] DB 조회 결과 확인
//        System.out.println(">>> DB에서 조회된 엔티티 개수: " + entities.size());
        for(UserChallenge entity : entities){

//            // [로그]
//            System.out.println(">>> 변환 중인 챌린지 ID: " + entity.getId());
            // 1. 엔티티 안에 연결된 Challenge 객체를 꺼낸다.
            Challenge challenge = entity.getChallenge();
            Badge badge = challenge.getBadge(); // Challenge 엔티티에 정의된 badge를 가져옴

            // 2. Badge 엔티티를 BadgeDto로 변환한다.
            BadgeDto bDto = null;
            if (badge != null){
                bDto = new BadgeDto(
                        badge.getId(),
                        badge.getName(),
                        badge.getDescription(),
                        badge.getIconUrl(),
                        badge.getDifficulty()
                );
            }

            // 3. 변환한 bDto를 ChallengeDto의 마지막 인자에 넣어준다.
            ChallengeDto cDto = new ChallengeDto(
                    challenge.getId(),
                    challenge.getTitle(),
                    challenge.getDescription(),
                    challenge.getDifficulty(),
                    challenge.getTargetType(),
                    String.valueOf(challenge.getTargetValue()),
                    challenge.getStartedAt(),
                    challenge.getEndedAt(),
                    bDto
            );

            // 1. 퍼센트 계산 (기초 문법 버전)
            int target = challenge.getTargetValue(); // 목표치
            int current = entity.getProgressValue(); // 현재 진행도

            // 정수 나눗셈은 0이 될 수 있으므로 double로 형변환 후 계산
            int percent = (int) ((double) current / target * 100);

            // 100%가 넘지 않도록 처리
            if (percent > 100) {
                percent = 100;
            }

            // 챌린지 종료일과 현재 날짜 사이의 차이 계산
            // UserChallengeService.java 내부
            long days = 0;
            if (challenge != null && challenge.getEndedAt() != null) {
                days = ChronoUnit.DAYS.between(LocalDate.now(), challenge.getEndedAt().toLocalDate());
            }
            // days가 음수(종료일 지남)가 나오는 것이 싫다면 아래 한 줄 추가
            days = Math.max(0, days);

            // 4. 최종적으로 UserChallengeDto를 만들어 리스트에 추가한다.
            UserChallengeDto ucDto = new UserChallengeDto(
                    entity.getId(),
                    entity.getUser().getId(),
                    cDto,
                    entity.getProgressValue(),
                    entity.getStatus(),
                    entity.getStartedAt(),
                    entity.getCompletedAt(),
                    percent,
                    days
            );

            dtos.add(ucDto);
        }
        return dtos;
    }

    /* ===============================
       진행도 갱신
       =============================== */
    @Transactional
    public void updateProgress(Long userId, String type, int value) {

        List<UserChallenge> ongoingList =
                userChallengeRepository.findAllByUserIdAndStatus(userId, "IN_PROGRESS");

        for (UserChallenge uc : ongoingList) {

            Challenge challenge = uc.getChallenge();

            if (!challenge.getTargetType().equals(type)) {
                continue;
            }

            int newProgress = uc.getProgressValue() + value;
            newProgress = Math.min(newProgress, challenge.getTargetValue());

            uc.setProgressValue(newProgress);

            if (newProgress >= challenge.getTargetValue()) {
                completeAndCreateNextChallenge(uc);
            }
        }
    }

    /* ===============================
       완료 처리 + 다음 난이도 생성
       =============================== */
    private void completeAndCreateNextChallenge(UserChallenge uc) {

        Challenge challenge = uc.getChallenge();
        User user = uc.getUser();

        // 1. 현재 챌린지 완료
        uc.setStatus("COMPLETED");
        uc.setCompletedAt(LocalDateTime.now());

        // 2. 현재 뱃지 지급
        if (challenge.getBadge() != null) {
            giveBadgeToUser(user, challenge.getBadge());
        }

        // 3. 다음 난이도 계산
        String nextDifficulty = getNextDifficulty(challenge.getDifficulty());
        if (nextDifficulty == null) {
            return; // EXPERT 완료 시 종료
        }

        // 4. 다음 챌린지 조회
        Challenge nextChallenge = (Challenge) challengeRepository
                .findByTargetTypeAndDifficulty(
                        challenge.getTargetType(),
                        nextDifficulty
                )
                .orElseThrow(() ->
                        new IllegalStateException("다음 난이도 챌린지가 존재하지 않습니다.")
                );

        // 5. 다음 뱃지 조회 (ID + 1)
        Badge nextBadge = null;
        if (challenge.getBadge() != null) {
            Long nextBadgeId = challenge.getBadge().getId() + 1;

            nextBadge = badgeRepository.findById(nextBadgeId)
                    .orElseThrow(() ->
                            new IllegalStateException("다음 뱃지가 존재하지 않습니다.")
                    );
        }

        // 6. 새로운 UserChallenge 생성
        UserChallenge nextUserChallenge = UserChallenge.builder()
                .user(user)
                .challenge(nextChallenge)
                .badge(nextBadge)
                .progressValue(0)
                .status("IN_PROGRESS")
                .startedAt(LocalDateTime.now())
                .build();

        userChallengeRepository.save(nextUserChallenge);
    }

    /* ===============================
       난이도 승급 규칙
       =============================== */
    private String getNextDifficulty(String current) {
        return switch (current) {
            case "EASY" -> "NORMAL";
            case "NORMAL" -> "HARD";
            case "HARD" -> "EXPERT";
            case "EXPERT" -> null;
            default -> null;
        };
    }

    /* ===============================
       뱃지 지급
       =============================== */
    private void giveBadgeToUser(User user, Badge badge) {
        if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
            UserBadge userBadge = new UserBadge(user, badge);
            userBadgeRepository.save(userBadge);
        }
    }
}