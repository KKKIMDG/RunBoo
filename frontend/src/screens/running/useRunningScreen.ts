import { useState, useEffect, useRef } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { createRecord } from "@/services/record/recordsService";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const toIsoPlus9 = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

export const useRunningScreen = () => {
  useKeepAwake();
  const navigation = useNavigation<RunningScreenNavigationProp>();
  const route = useRoute<RunningScreenRouteProp>();

  const userId = route?.params?.userId;
  const targetDistance = route.params?.targetDistance ?? 0;

  const [isReady, setIsReady] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [paceHistory, setPaceHistory] = useState<number[]>([]);
  const [isFollowing, setIsFollowing] = useState(true);
  const [initialLocation, setInitialLocation] = useState<Coordinate | null>(
    null
  );

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onLocationUpdate = useRef<((coords: Coordinate) => void) | null>(null);

  const lastRawLocation = useRef<Coordinate | null>(null);
  const lastDisplayedLocation = useRef<Coordinate | null>(null);

  const utils = {
    formatTime: (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${
        sec < 10 ? "0" + sec : sec
      }`;
    },
    formatPace: (p: number) => {
      if (p === 0 || !isFinite(p) || p > 3600) return "-'--\"";
      const m = Math.floor(p / 60);
      const s = Math.floor(p % 60);
      return `${m}'${s < 10 ? "0" + s : s}"`;
    },
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setInitialLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (isReady && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isReady && countdown === 0) {
      setIsReady(false);
      setIsRunning(true);
      startLocationTracking();
    }
  }, [isReady, countdown]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1, // 미세 데이터 수집 후 필터링에서 거름
      },
      (newLocation) => {
        const { latitude, longitude, accuracy, speed } = newLocation.coords;

        // 1. 정확도 필터: 오차 범위가 12m 이상이면 무시 (노이즈 방지)
        if (accuracy && accuracy > 12) return;

        // 2. 속도 필터: 시속 약 1.8km/h (0.5m/s) 미만의 움직임은 정지로 간주
        // 휴대폰만 흔드는 동작은 보통 낮은 속도로 잡힙니다.
        if (speed !== null && speed < 0.5) return;

        if (lastRawLocation.current) {
          const rawDist = getDistance(
            lastRawLocation.current.latitude,
            lastRawLocation.current.longitude,
            latitude,
            longitude
          );

          // 3. 거리 필터: 이전 좌표와 현재 좌표 거리가 2m 이상일 때만 위치 이동 인정
          if (rawDist >= 2 && rawDist < 15) {
            setDistance((prev) => prev + rawDist);

            if (speed && speed > 0.5) {
              setCurrentPace(1000 / speed);
            }

            // 지도 표시용 좌표 업데이트 (부드럽게 보정)
            let displayLat = latitude;
            let displayLng = longitude;

            if (lastDisplayedLocation.current) {
              displayLat =
                lastDisplayedLocation.current.latitude * 0.6 + latitude * 0.4;
              displayLng =
                lastDisplayedLocation.current.longitude * 0.6 + longitude * 0.4;
            }

            const smoothedCoords = {
              latitude: displayLat,
              longitude: displayLng,
            };
            lastDisplayedLocation.current = smoothedCoords;
            lastRawLocation.current = { latitude, longitude };

            setRouteCoordinates((prev) => [...prev, smoothedCoords]);
            if (onLocationUpdate.current)
              onLocationUpdate.current(smoothedCoords);
          }
        } else {
          lastRawLocation.current = { latitude, longitude };
          lastDisplayedLocation.current = { latitude, longitude };
        }
      }
    );
  };

  const stopRun = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    locationSubscription.current?.remove();

    const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;

    const requestData = {
      userId: userId ? Number(userId) : 0,
      mode: "NORMAL" as const,
      distanceM: Math.floor(distance),
      durationSec: time,
      avgPace: Math.floor(avgPaceSec),
      calories: Math.floor(distance * 0.05),
      routePolyline: encodePath(routeCoordinates),
      startedAt: toIsoPlus9(new Date(Date.now() - time * 1000)),
      endedAt: toIsoPlus9(new Date()),
    };

    try {
      await createRecord(requestData);
    } catch (e) {
      console.error(e);
    }

    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: time,
      avgPaceSec,
      calories: Math.floor(distance * 0.05),
      routeCoordinates,
    });
  };

  return {
    state: {
      isReady,
      countdown,
      isRunning,
      isPaused,
      time,
      distance,
      currentPace,
      routeCoordinates,
      paceHistory,
      targetDistance,
      isFollowing,
      initialLocation,
    },
    actions: {
      pauseRun: () => setIsPaused(true),
      resumeRun: () => setIsPaused(false),
      stopRun,
      toggleFollowing: () => setIsFollowing(!isFollowing),
      setIsFollowing,
      onLocationUpdate,
    },
    utils,
  };
};
