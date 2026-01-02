package com.runboo.domain.runner.service;

import com.runboo.domain.runner.dto.LocationRequest;
import com.runboo.domain.runner.dto.RunnerResponse;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
// ★ 중요: METERS를 쓰기 위해 DistanceUnit을 임포트해야 합니다.
import org.springframework.data.redis.connection.RedisGeoCommands.DistanceUnit;
import org.springframework.data.redis.core.GeoOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RunnerService {

    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    private final String REDIS_KEY = "active_runners";

    @Transactional
    public List<RunnerResponse> updateAndGetNearbyRunners(String email, LocationRequest request) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("로그인 유저 정보를 찾을 수 없습니다."));

        Long myId = me.getId();

        GeoOperations<String, String> geoOps = redisTemplate.opsForGeo();

        geoOps.add(REDIS_KEY, new Point(request.getLongitude(), request.getLatitude()), String.valueOf(myId));
        redisTemplate.expire(REDIS_KEY, 1, TimeUnit.HOURS);

        Circle circle = new Circle(
                new Point(request.getLongitude(), request.getLatitude()),
                new Distance(request.getRadius(), DistanceUnit.METERS)
        );

        RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs
                .newGeoRadiusArgs()
                .includeCoordinates();

        GeoResults<RedisGeoCommands.GeoLocation<String>> results = geoOps.radius(REDIS_KEY, circle, args);

        List<RunnerResponse> responseList = new ArrayList<>();

        if (results != null) {
            for (GeoResult<RedisGeoCommands.GeoLocation<String>> result : results) {
                String memberIdStr = result.getContent().getName();
                Long memberId = Long.parseLong(memberIdStr);

                if (memberId.equals(myId)) continue;

                Point point = result.getContent().getPoint();

                User nearbyUser = userRepository.findById(memberId).orElse(null);
                if (nearbyUser == null) continue;

                responseList.add(RunnerResponse.builder()
                        .userId(memberId)
                        .nickname(nearbyUser.getNickname())
                        .latitude(point.getY())
                        .longitude(point.getX())
                        .profileImageUrl(nearbyUser.getProfileImageUrl())
                        .build());
            }
        }

        return responseList;
    }
}