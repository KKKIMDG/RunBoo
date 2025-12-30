package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.challenge.dto.ChallengeDto;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserChallengeService {

    private  UserChallengeRepository userChallengeRepository;

    public List<UserChallengeDto> getUserChallengeListByStatus(Long userId, String status){
        List<UserChallenge> entities = userChallengeRepository.findAllByUserIdAndStatus(userId, status);
        List<UserChallengeDto> dtos = new ArrayList<>();

        for(UserChallenge entity : entities){
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

            // 4. 최종적으로 UserChallengeDto를 만들어 리스트에 추가한다.
            UserChallengeDto ucDto = new UserChallengeDto(
                    entity.getId(),
                    entity.getUser().getId(),
                    cDto,
                    entity.getProgressValue(),
                    entity.getStatus(),
                    entity.getStartedAt(),
                    entity.getCompletedAt()
            );

            dtos.add(ucDto);
        }
        return dtos;
    }
}
