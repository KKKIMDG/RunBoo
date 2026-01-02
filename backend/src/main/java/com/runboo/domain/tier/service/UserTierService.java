package com.runboo.domain.tier.service;

import com.runboo.domain.tier.dto.UserTierResponse;
import com.runboo.domain.tier.entity.Tier;
import com.runboo.domain.tier.entity.UserTier;
import com.runboo.domain.tier.entity.UserTier   .DistanceType;
import com.runboo.domain.tier.repository.TierRepository;
import com.runboo.domain.tier.repository.UserTierRepository;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserTierService {

    private final UserTierRepository userTierRepository;
    private final UserRepository userRepository;
    private final TierRepository tierRepository;

    public UserTierResponse saveUserTier(Long userId, Long tierId, String distanceType) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        Tier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 티어입니다."));

        DistanceType distanceEnum = DistanceType.valueOf(distanceType);

        UserTier userTier = UserTier.create(
                user,
                distanceEnum,
                tier
        );

        UserTier savedUserTier = userTierRepository.save(userTier);

        return UserTierResponse.from(savedUserTier);
    }
}
