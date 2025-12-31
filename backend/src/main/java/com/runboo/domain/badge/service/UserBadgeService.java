package com.runboo.domain.badge.service;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.badge.dto.UserBadgeDto;
import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service // 스프링이 관리하도록 추가
@RequiredArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;

    @Transactional(readOnly = true)
    public List<UserBadgeDto> getUserBadges(Long userId) {


        List<UserBadge> userBadgeList =
                userBadgeRepository.findAllByUserId(userId);

        return userBadgeList.stream()
                .map(ub -> new UserBadgeDto(
                        ub.getId(),
                        ub.getUser().getId(),
                        new BadgeDto(
                                ub.getBadge().getId(),
                                ub.getBadge().getName(),
                                ub.getBadge().getDescription(),
                                ub.getBadge().getIconUrl(),
                                ub.getBadge().getDifficulty()
                        ),
                        ub.getAcquiredAt()
                ))
                .toList();
    }
}