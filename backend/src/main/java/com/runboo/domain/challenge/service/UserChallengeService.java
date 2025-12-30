package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.challenge.dto.ChallengeDto;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // 추가
public class UserChallengeService {

    private final UserChallengeRepository userChallengeRepository;

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

            // 4. 최종적으로 UserChallengeDto를 만들어 리스트에 추가한다.
            UserChallengeDto ucDto = new UserChallengeDto(
                    entity.getId(),
                    entity.getUser().getId(),
                    cDto,
                    entity.getProgressValue(),
                    entity.getStatus(),
                    entity.getStartedAt(),
                    entity.getCompletedAt(),
                    percent
            );

            dtos.add(ucDto);
        }
        return dtos;
    }

    // 챌린지 타입에 따른 벨류를 받아 진행도 갱신
    @Transactional
    public void updateProgress(Long userId, String type, int value){
        // 1. 유저가 진행 중인 챌린지 중 해당 타입(TOTAL_DISTANCE 또는 STREAK_DAYS)만 가져온다.
        List<UserChallenge> ongoingList = userChallengeRepository.findAllByUserIdAndStatus(userId, "IN_PROGRESS");

        for (UserChallenge uc : ongoingList) {
            Challenge challenge = uc.getChallenge();

            // 챌린지 타입이 맞는지 확인 (예: 타입이 TOTAL_DISTANCE인 것만 거리 업데이트) | 타입이 일치하는 경우에만 수치 갱신
            if(challenge.getTargetType().equals(type)){

                // 2. 현재 진행도 업데이트
                int newProgress = uc.getProgressValue() + value;

                // 합산된 결과가 목표치보다 크면 목표치로 고정
                if (newProgress > challenge.getTargetValue()) {
                    newProgress = challenge.getTargetValue();
                }
                uc.setProgressValue(newProgress);

                // 4. 목표 달성 시 상태 변경
                if(newProgress >= challenge.getTargetValue()){
                    uc.setStatus("COMPLETED");
                    uc.setCompletedAt(OffsetDateTime.now());
                }
            }
        }
    }
}
