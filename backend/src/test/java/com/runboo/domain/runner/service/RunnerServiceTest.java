package com.runboo.domain.runner.service;

import com.runboo.domain.runner.dto.LocationRequest;
import com.runboo.domain.runner.dto.RunnerResponse;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.GeoOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RunnerServiceTest {

    private static final String ACTIVE_RUNNERS_KEY = "active_runners";

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private GeoOperations<String, String> geoOperations;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private UserRepository userRepository;

    private RunnerService runnerService;

    @BeforeEach
    void setUp() {
        runnerService = new RunnerService(redisTemplate, userRepository);
        ReflectionTestUtils.setField(runnerService, "heartbeatTtlSeconds", 60L);

        when(redisTemplate.opsForGeo()).thenReturn(geoOperations);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void refreshesHeartbeatAndReturnsOnlyActiveNearbyRunners() {
        User me = user(1L);
        User nearbyRunner = org.mockito.Mockito.mock(User.class);
        LocationRequest request = new LocationRequest(37.5665, 126.9780, 500);

        when(nearbyRunner.getNickname()).thenReturn("러너");
        when(nearbyRunner.isBlind()).thenReturn(false);
        when(userRepository.findByEmail("me@runboo.local")).thenReturn(Optional.of(me));
        when(geoOperations.radius(
                eq(ACTIVE_RUNNERS_KEY),
                any(Circle.class),
                any(RedisGeoCommands.GeoRadiusCommandArgs.class)
        ))
                .thenReturn(geoResults(
                        geoLocation("1", 126.9780, 37.5665),
                        geoLocation("2", 126.9781, 37.5666)
                ));
        when(redisTemplate.hasKey("active_runner:last_seen:2")).thenReturn(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(nearbyRunner));

        List<RunnerResponse> result =
                runnerService.updateAndGetNearbyRunners("me@runboo.local", request);

        assertThat(result)
                .singleElement()
                .satisfies(runner -> {
                    assertThat(runner.getUserId()).isEqualTo(2L);
                    assertThat(runner.getNickname()).isEqualTo("러너");
                });

        verify(valueOperations).set(
                "active_runner:last_seen:1",
                "active",
                Duration.ofSeconds(60)
        );
        verify(redisTemplate).persist(ACTIVE_RUNNERS_KEY);
        verify(redisTemplate, never()).expire(eq(ACTIVE_RUNNERS_KEY), any(Duration.class));
        verify(geoOperations, never()).remove(eq(ACTIVE_RUNNERS_KEY), any());
    }

    @Test
    void removesExpiredRunnerFromGeoSetAndExcludesItFromResponse() {
        User me = user(1L);
        LocationRequest request = new LocationRequest(37.5665, 126.9780, 500);

        when(userRepository.findByEmail("me@runboo.local")).thenReturn(Optional.of(me));
        when(geoOperations.radius(
                eq(ACTIVE_RUNNERS_KEY),
                any(Circle.class),
                any(RedisGeoCommands.GeoRadiusCommandArgs.class)
        ))
                .thenReturn(geoResults(
                        geoLocation("1", 126.9780, 37.5665),
                        geoLocation("2", 126.9781, 37.5666)
                ));
        when(redisTemplate.hasKey("active_runner:last_seen:2")).thenReturn(false);

        List<RunnerResponse> result =
                runnerService.updateAndGetNearbyRunners("me@runboo.local", request);

        assertThat(result).isEmpty();
        verify(geoOperations).remove(ACTIVE_RUNNERS_KEY, "2");
        verify(userRepository, never()).findById(2L);
    }

    @ParameterizedTest(name = "nearby runners {0}: performs {0} individual user lookups")
    @ValueSource(ints = {10, 50, 100})
    void loadsEachNearbyRunnerIndividually(int nearbyRunnerCount) {
        User me = user(1L);
        User nearbyRunner = org.mockito.Mockito.mock(User.class);
        LocationRequest request = new LocationRequest(37.5665, 126.9780, 500);

        when(nearbyRunner.isBlind()).thenReturn(false);
        when(userRepository.findByEmail("me@runboo.local")).thenReturn(Optional.of(me));
        when(geoOperations.radius(
                eq(ACTIVE_RUNNERS_KEY),
                any(Circle.class),
                any(RedisGeoCommands.GeoRadiusCommandArgs.class)
        )).thenReturn(nearbyGeoResults(nearbyRunnerCount));
        when(redisTemplate.hasKey(any(String.class))).thenReturn(true);
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(nearbyRunner));

        List<RunnerResponse> result =
                runnerService.updateAndGetNearbyRunners("me@runboo.local", request);

        assertThat(result).hasSize(nearbyRunnerCount);
        verify(userRepository, times(nearbyRunnerCount)).findById(anyLong());
    }

    private User user(Long id) {
        User user = org.mockito.Mockito.mock(User.class);
        when(user.getId()).thenReturn(id);
        return user;
    }

    @SafeVarargs
    private GeoResults<RedisGeoCommands.GeoLocation<String>> geoResults(
            GeoResult<RedisGeoCommands.GeoLocation<String>>... results
    ) {
        return new GeoResults<>(List.of(results));
    }

    private GeoResult<RedisGeoCommands.GeoLocation<String>> geoLocation(
            String memberId,
            double longitude,
            double latitude
    ) {
        RedisGeoCommands.GeoLocation<String> location =
                new RedisGeoCommands.GeoLocation<>(
                        memberId,
                        new Point(longitude, latitude)
                );
        return new GeoResult<>(location, new Distance(0));
    }

    private GeoResults<RedisGeoCommands.GeoLocation<String>> nearbyGeoResults(
            int nearbyRunnerCount
    ) {
        List<GeoResult<RedisGeoCommands.GeoLocation<String>>> results = new ArrayList<>();
        results.add(geoLocation("1", 126.9780, 37.5665));

        for (long userId = 2; userId < nearbyRunnerCount + 2L; userId++) {
            double offset = userId * 0.000001;
            results.add(geoLocation(
                    String.valueOf(userId),
                    126.9780 + offset,
                    37.5665 + offset
            ));
        }

        return new GeoResults<>(results);
    }
}
