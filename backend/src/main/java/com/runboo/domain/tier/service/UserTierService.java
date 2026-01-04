package com.runboo.domain.tier.service;

import com.runboo.domain.tier.dto.UserTierResponse;
import com.runboo.domain.tier.entity.Tier;
import com.runboo.domain.tier.entity.UserTier;
import com.runboo.domain.tier.entity.UserTier.DistanceType;
import com.runboo.domain.tier.repository.TierRepository;
import com.runboo.domain.tier.repository.UserTierRepository;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserTierService {

    private final UserTierRepository userTierRepository;
    private final UserRepository userRepository;
    private final TierRepository tierRepository;

    @Transactional // ✅ 데이터 수정을 위해 트랜잭션 추가
    public UserTierResponse saveUserTier(Long userId, Long tierId, String distanceType) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        Tier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 티어입니다."));

        DistanceType distanceEnum = DistanceType.valueOf(distanceType.toUpperCase());

        // ✅ 1. 기존 티어 정보가 있는지 확인 (Upsert 로직)
        Optional<UserTier> existingUserTier = userTierRepository.findByUserAndDistanceType(user, distanceEnum);

        UserTier savedUserTier;
        if (existingUserTier.isPresent()) {
            // ✅ 2. 이미 있다면 티어 정보만 업데이트 (UPDATE)
            UserTier userTier = existingUserTier.get();
            userTier.updateTier(tier); // UserTier 엔티티에 updateTier 메서드가 있어야 합니다.
            savedUserTier = userTier;
            // @Transactional이 있으므로 별도로 save()를 안 불러도 변경 감지(Dirty Checking)로 업데이트됩니다.
        } else {
            // ✅ 3. 없다면 새로 생성 (INSERT)
            UserTier newUserTier = UserTier.create(user, distanceEnum, tier);
            savedUserTier = userTierRepository.save(newUserTier);
        }

        return UserTierResponse.from(savedUserTier);
    }
}