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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
        User nearbyRunner = user(2L);
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
        when(valueOperations.multiGet(List.of("active_runner:last_seen:2")))
                .thenReturn(List.of("active"));
        when(userRepository.findAllById(any())).thenReturn(List.of(nearbyRunner));

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
        verify(userRepository, never()).findById(anyLong());
        verify(userRepository).findAllById(any());
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
        when(valueOperations.multiGet(List.of("active_runner:last_seen:2")))
                .thenReturn(Collections.singletonList(null));

        List<RunnerResponse> result =
                runnerService.updateAndGetNearbyRunners("me@runboo.local", request);

        assertThat(result).isEmpty();
        verify(geoOperations).remove(ACTIVE_RUNNERS_KEY, "2");
        verify(userRepository, never()).findById(anyLong());
        verify(userRepository, never()).findAllById(any());
    }

    @ParameterizedTest(name = "nearby runners {0}: performs 1 batch user lookup")
    @ValueSource(ints = {10, 50, 100})
    void loadsNearbyRunnersWithSingleBatchLookup(int nearbyRunnerCount) {
        User me = user(1L);
        List<User> nearbyUsers = nearbyUsers(nearbyRunnerCount);
        LocationRequest request = new LocationRequest(37.5665, 126.9780, 500);

        when(userRepository.findByEmail("me@runboo.local")).thenReturn(Optional.of(me));
        when(geoOperations.radius(
                eq(ACTIVE_RUNNERS_KEY),
                any(Circle.class),
                any(RedisGeoCommands.GeoRadiusCommandArgs.class)
        )).thenReturn(nearbyGeoResults(nearbyRunnerCount));
        when(valueOperations.multiGet(any()))
                .thenReturn(Collections.nCopies(nearbyRunnerCount, "active"));
        when(userRepository.findAllById(any())).thenReturn(nearbyUsers);

        List<RunnerResponse> result =
                runnerService.updateAndGetNearbyRunners("me@runboo.local", request);

        assertThat(result).hasSize(nearbyRunnerCount);
        verify(userRepository, never()).findById(anyLong());
        verify(userRepository, times(1)).findAllById(any());
        List<String> expectedKeys = nearbyUsers.stream()
                .map(user -> "active_runner:last_seen:" + user.getId())
                .toList();
        verify(valueOperations, times(1)).multiGet(expectedKeys);
        verify(redisTemplate, never()).hasKey(any());
    }

    @Test
    void matchesHeartbeatResultsToCandidateOrder() {
        User me = user(1L);
        User runnerTwo = user(2L);
        User runnerFour = user(4L);
        when(userRepository.findByEmail("me@runboo.local")).thenReturn(Optional.of(me));
        when(geoOperations.radius(eq(ACTIVE_RUNNERS_KEY), any(Circle.class),
                any(RedisGeoCommands.GeoRadiusCommandArgs.class)))
                .thenReturn(geoResults(
                        geoLocation("1", 126.9780, 37.5665),
                        geoLocation("4", 126.9784, 37.5669),
                        geoLocation("3", 126.9783, 37.5668),
                        geoLocation("2", 126.9782, 37.5667)));
        when(valueOperations.multiGet(List.of(
                "active_runner:last_seen:4", "active_runner:last_seen:3",
                "active_runner:last_seen:2")))
                .thenReturn(Arrays.asList("active", null, "active"));
        when(userRepository.findAllById(any())).thenReturn(List.of(runnerTwo, runnerFour));

        List<RunnerResponse> result = runnerService.updateAndGetNearbyRunners(
                "me@runboo.local", new LocationRequest(37.5665, 126.9780, 500));

        assertThat(result).extracting(RunnerResponse::getUserId).containsExactly(4L, 2L);
        assertThat(result.get(0).getLongitude()).isEqualTo(126.9784);
        assertThat(result.get(1).getLatitude()).isEqualTo(37.5667);
        verify(userRepository).findAllById(Set.of(4L, 2L));
        verify(geoOperations).remove(ACTIVE_RUNNERS_KEY, "3");
        verify(geoOperations, never()).remove(ACTIVE_RUNNERS_KEY, "4");
        verify(geoOperations, never()).remove(ACTIVE_RUNNERS_KEY, "2");
        verify(redisTemplate, never()).hasKey(any());
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2})
    void skipsHeartbeatLookupWhenThereAreNoOtherCandidates(int resultType) {
        User me = user(1L);
        when(userRepository.findByEmail("me@runboo.local")).thenReturn(Optional.of(me));
        GeoResults<RedisGeoCommands.GeoLocation<String>> results = switch (resultType) {
            case 0 -> null;
            case 1 -> geoResults();
            default -> geoResults(geoLocation("1", 126.9780, 37.5665));
        };
        when(geoOperations.radius(eq(ACTIVE_RUNNERS_KEY), any(Circle.class),
                any(RedisGeoCommands.GeoRadiusCommandArgs.class))).thenReturn(results);

        assertThat(runnerService.updateAndGetNearbyRunners(
                "me@runboo.local", new LocationRequest(37.5665, 126.9780, 500))).isEmpty();

        verify(valueOperations, never()).multiGet(any());
        verify(userRepository, never()).findAllById(any());
        verify(redisTemplate, never()).hasKey(any());
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

    private List<User> nearbyUsers(int nearbyRunnerCount) {
        List<User> users = new ArrayList<>();

        for (long userId = 2; userId < nearbyRunnerCount + 2L; userId++) {
            users.add(user(userId));
        }

        return users;
    }
}
