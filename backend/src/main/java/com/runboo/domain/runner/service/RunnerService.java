package com.runboo.domain.runner.service;

import com.runboo.domain.runner.dto.LocationRequest;
import com.runboo.domain.runner.dto.RunnerResponse;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.GeoOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RunnerService {

    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    private final String REDIS_KEY = "active_runners";

    public List<RunnerResponse> updateAndGetNearbyRunners(Long myId, LocationRequest request) {
        GeoOperations<String, String> geoOps = redisTemplate.opsForGeo();

        geoOps.add(REDIS_KEY, new Point(request.getLongitude(), request.getLatitude()), String.valueOf(myId));
        redisTemplate.expire(REDIS_KEY, 1, TimeUnit.HOURS);

        Circle circle = new Circle(
                new Point(request.getLongitude(), request.getLatitude()),
                new Distance(request.getRadius(), Metrics.KILOMETERS)
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

                User user = userRepository.findById(memberId).orElse(null);

                if (user == null) continue;

                responseList.add(RunnerResponse.builder()
                        .userId(memberId)
                        .nickname(user.getNickname())
                        .latitude(point.getY())
                        .longitude(point.getX())
                        .profileImageUrl(user.getProfileImageUrl())
                        .build());
            }
        }

        return responseList;
    }
}