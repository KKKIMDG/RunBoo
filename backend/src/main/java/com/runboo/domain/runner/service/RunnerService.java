package com.runboo.domain.runner.service;

import com.runboo.domain.runner.dto.LocationRequest;
import com.runboo.domain.runner.dto.RunnerResponse;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.connection.RedisGeoCommands.DistanceUnit;
import org.springframework.data.redis.core.GeoOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RunnerService {

    private static final String ACTIVE_RUNNERS_KEY = "active_runners";
    private static final String HEARTBEAT_KEY_PREFIX = "active_runner:last_seen:";

    private final RedisTemplate<String, String> redisTemplate;
    private final UserRepository userRepository;

    @Value("${runner.location.heartbeat-ttl-seconds:60}")
    private long heartbeatTtlSeconds;

    @Transactional
    public List<RunnerResponse> updateAndGetNearbyRunners(String email, LocationRequest request) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("로그인 유저 정보를 찾을 수 없습니다."));

        Long myId = me.getId();

        GeoOperations<String, String> geoOps = redisTemplate.opsForGeo();

        String myMemberId = String.valueOf(myId);
        geoOps.add(
                ACTIVE_RUNNERS_KEY,
                new Point(request.getLongitude(), request.getLatitude()),
                myMemberId
        );
        redisTemplate.persist(ACTIVE_RUNNERS_KEY);
        refreshHeartbeat(myId);

        Circle circle = new Circle(
                new Point(request.getLongitude(), request.getLatitude()),
                new Distance(request.getRadius(), DistanceUnit.METERS)
        );

        RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs
                .newGeoRadiusArgs()
                .includeCoordinates();

        GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                geoOps.radius(ACTIVE_RUNNERS_KEY, circle, args);

        Map<Long, Point> activeRunnerPoints = new LinkedHashMap<>();

        if (results != null) {
            for (GeoResult<RedisGeoCommands.GeoLocation<String>> result : results) {
                String memberIdStr = result.getContent().getName();
                Long memberId = Long.parseLong(memberIdStr);

                if (memberId.equals(myId)) continue;

                if (!hasActiveHeartbeat(memberId)) {
                    geoOps.remove(ACTIVE_RUNNERS_KEY, memberIdStr);
                    continue;
                }

                activeRunnerPoints.put(memberId, result.getContent().getPoint());
            }
        }

        if (activeRunnerPoints.isEmpty()) {
            return List.of();
        }

        Map<Long, User> usersById = userRepository.findAllById(activeRunnerPoints.keySet())
                .stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<RunnerResponse> responseList = new ArrayList<>();
        for (Map.Entry<Long, Point> entry : activeRunnerPoints.entrySet()) {
            Long memberId = entry.getKey();
            User nearbyUser = usersById.get(memberId);

            if (nearbyUser == null) continue;
            if (nearbyUser.isBlind()) continue;

            Point point = entry.getValue();
            responseList.add(RunnerResponse.builder()
                    .userId(memberId)
                    .nickname(nearbyUser.getNickname())
                    .latitude(point.getY())
                    .longitude(point.getX())
                    .profileImageUrl(nearbyUser.getProfileImageUrl())
                    .build());
        }

        return responseList;
    }

    private void refreshHeartbeat(Long userId) {
        ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(
                heartbeatKey(userId),
                "active",
                Duration.ofSeconds(heartbeatTtlSeconds)
        );
    }

    private boolean hasActiveHeartbeat(Long userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(heartbeatKey(userId)));
    }

    private String heartbeatKey(Long userId) {
        return HEARTBEAT_KEY_PREFIX + userId;
    }
}
