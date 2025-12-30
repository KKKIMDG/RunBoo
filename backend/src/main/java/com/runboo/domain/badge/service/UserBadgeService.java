package com.runboo.domain.badge.service;

import com.runboo.domain.badge.dto.BadgeDto;
import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service // 스프링이 관리하도록 추가
@RequiredArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;

    @Transactional(readOnly = true) // 조회 전용이므로 readOnly 추가
    public List<BadgeDto> getUserBadges(Long userId) {
        // 1. DB에서 해당 유저의 매핑 데이터(UserBadge)를 다 가져옵니다.
        List<UserBadge> userBadgeList = userBadgeRepository.findAllByUserId(userId);

        // 2. 결과를 담을 빈 통(List)을 만듭니다.
        List<BadgeDto> resultList = new ArrayList<>();

        // 3. 반복문을 돌면서 Badge 정보만 DTO로 바꿔서 통에 담습니다.
        for (UserBadge ub : userBadgeList) {
            Badge badge = ub.getBadge(); // 먼저 뱃지 엔티티를 꺼냄

            // 생성자가 받는 순서대로 (id, name, desc...) 직접 넣어줌
            BadgeDto dto = new BadgeDto(
                    badge.getId(),
                    badge.getName(),
                    badge.getDescription(),
                    badge.getIconUrl(),
                    badge.getDifficulty()
            );

            resultList.add(dto);
        }

        // 4. 완성된 리스트를 반환합니다.
        return resultList;
    }
}