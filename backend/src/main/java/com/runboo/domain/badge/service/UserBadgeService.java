package com.runboo.domain.badge.service;

import com.runboo.domain.badge.dto.UserBadgeDto;
import com.runboo.domain.badge.entity.Badge;
import com.runboo.domain.badge.entity.UserBadge;
import com.runboo.domain.badge.repository.BadgeRepository;
import com.runboo.domain.badge.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;

    @Transactional(readOnly = true)
    public List<UserBadgeDto> getUserBadges(Long userId) {
        // 1. 유저가 획득한 뱃지 이력 조회
        List<UserBadge> userBadgeList = userBadgeRepository.findAllByUserId(userId);
        List<UserBadgeDto> dtoList = new ArrayList<>();

        // 2. 반복문을 돌며 상세 정보와 합쳐 DTO 생성
        for (UserBadge ub : userBadgeList) {
            // 뱃지 마스터 정보 조회
            Badge badge = badgeRepository.findById(ub.getBadgeId())
                    .orElseThrow(() -> new RuntimeException("뱃지 정보를 찾을 수 없습니다."));

            // 요청하신 DTO 필드 순서대로 데이터 세팅
            UserBadgeDto dto = new UserBadgeDto(
                    ub.getUserBadgeId(),
                    ub.getUserId(),
                    badge.getBadgeId(),
                    badge.getName(),
                    badge.getDescription(),
                    badge.getIconUrl(),
                    ub.getAcquiredAt()
            );

            dtoList.add(dto);
        }

        return dtoList;
    }
}