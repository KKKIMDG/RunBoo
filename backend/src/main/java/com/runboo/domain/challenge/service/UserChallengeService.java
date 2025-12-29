package com.runboo.domain.challenge.service;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.challenge.dto.ChallengeDto;
import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.entity.Challenge;
import com.runboo.domain.challenge.entity.UserChallenge;
import com.runboo.domain.challenge.repository.UserChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserChallengeService {

    private final UserChallengeRepository userChallengeRepository;

    public List<UserChallengeDto> getOngoingChallenges(int userId) {
        return userChallengeRepository.findByUserIdAndStatus(userId, "IN_PROGRESS")
                .stream()
                .map(this::toDto)
                .toList();
    }

    private UserChallengeDto toDto(UserChallenge uc) {
        Challenge c = uc.getChallenge();
        BadgeDto challengeBadgeDto = c.getBadge() == null ? null :
                new BadgeDto(c.getBadge().getBadgeId(),
                        c.getBadge().getName(),
                        c.getBadge().getDescription(),
                        c.getBadge().getIconUrl(),
                        c.getBadge().getDifficulty());

        ChallengeDto challengeDto = new ChallengeDto(
                c.getChallengeId(),
                c.getTitle(),
                c.getDescription(),
                c.getDifficulty(),
                c.getTargetType(),
                c.getStartedAt(),
                c.getEndedAt(),
                challengeBadgeDto
        );

        BadgeDto userBadgeDto = uc.getBadge() == null ? null :
                new BadgeDto(uc.getBadge().getBadgeId(),
                        uc.getBadge().getName(),
                        uc.getBadge().getDescription(),
                        uc.getBadge().getIconUrl(),
                        uc.getBadge().getDifficulty());

        return new UserChallengeDto(
                uc.getUserChallengeId(),
                uc.getUser().getId(),
                challengeDto,
                uc.getProgressValue(),
                uc.getStatus(),
                uc.getStartedAt(),
                uc.getCompletedAt()
        );
    }
}