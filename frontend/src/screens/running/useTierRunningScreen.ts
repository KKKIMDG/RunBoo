import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { evaluateTier } from "@/services/tier/tierService";
import { createRecord, fetchMyRecords } from "@/services/record/recordsService";

type TierRunningRouteProp = RouteProp<RootStackParamList, "TierRunning">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const toIsoPlus9 = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

export const useTierRunningScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TierRunningRouteProp>();
  const userId = route?.params?.userId;
  const targetDistance = route.params?.targetDistance ?? 5000;
  const distanceTypeKey: "5k" | "10k" = targetDistance <= 5000 ? "5k" : "10k";

  const [isReady, setIsReady] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(targetDistance);
  const [currentPace, setCurrentPace] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [paceHistory, setPaceHistory] = useState<number[]>([]);
  const [initialLocation, setInitialLocation] = useState<Coordinate | null>(
    null
  );
  const [lastLocation, setLastLocation] = useState<Coordinate | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
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
    const remain = targetDistance - distance;
    setRemainingDistance(remain > 0 ? remain : 0);
    if (isRunning && distance >= targetDistance) handleComplete(false);
  }, [distance, isRunning]);

  useEffect(() => {
    if (isReady && countdown > 0) {
      const t = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (isReady && countdown === 0) {
      setIsReady(false);
      setIsRunning(true);
      startTracking();
    }
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prev) => {
          const next = prev + 1;
          // 5초마다 페이스 히스토리 기록 (차트용)
          if (next % 5 === 0 && currentPace > 0) {
            setPaceHistory((prevH) => [...prevH, currentPace / 60]);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, countdown, isRunning, isPaused, currentPace]);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude, accuracy, speed } = loc.coords;
        if (accuracy && accuracy > 12) return;
        if (speed !== null && speed > 7.0) return;

        if (lastRawLocation.current) {
          const rawDist = getDistance(
            lastRawLocation.current.latitude,
            lastRawLocation.current.longitude,
            latitude,
            longitude
          );
          if (rawDist >= 1.5 && rawDist < 10) {
            setDistance((cur) => cur + rawDist);
            if (speed && speed > 0.2) setCurrentPace(1000 / speed);

            let dLat = latitude,
              dLng = longitude;
            if (lastDisplayedLocation.current) {
              dLat =
                lastDisplayedLocation.current.latitude * 0.6 + latitude * 0.4;
              dLng =
                lastDisplayedLocation.current.longitude * 0.6 + longitude * 0.4;
            }
            const smoothed = { latitude: dLat, longitude: dLng };
            lastDisplayedLocation.current = smoothed;
            lastRawLocation.current = { latitude, longitude };
            setLastLocation(smoothed);
            setRouteCoordinates((prev) => [...prev, smoothed]);
          }
        } else {
          const first = { latitude, longitude };
          lastRawLocation.current = first;
          lastDisplayedLocation.current = first;
          setLastLocation(first);
        }
      }
    );
  };

  const handleComplete = async (isStopped: boolean = false) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    locationSub.current?.remove();
    const finalDist = Math.min(distance, targetDistance);
    const avgPace = finalDist > 0 ? time / (finalDist / 1000) : 0;

    try {
      const data = {
        userId: userId ? Number(userId) : 0,
        mode: "TIER" as const,
        distanceM: Math.floor(finalDist),
        durationSec: time,
        avgPace: Math.floor(avgPace),
        calories: Math.floor(finalDist * 0.05),
        routePolyline: encodePath(routeCoordinates),
        startedAt: toIsoPlus9(new Date(Date.now() - time * 1000)),
        endedAt: toIsoPlus9(new Date()),
      };
      await createRecord(data);
      const records = await fetchMyRecords();
      const finalRecordId = Math.max(...records.map((r: any) => r.id));

      if (isStopped) {
        navigation.navigate("RunResult", {
          distanceM: finalDist,
          durationSec: time,
          avgPaceSec: avgPace,
          calories: Math.floor(finalDist * 0.05),
          routeCoordinates,
        });
      } else {
        const tierData = await evaluateTier({
          recordId: finalRecordId,
          distanceType: distanceTypeKey,
        });
        navigation.navigate("TierResult", {
          userId,
          recordId: finalRecordId,
          distanceType: distanceTypeKey,
          stats: {
            distance: (finalDist / 1000).toFixed(2),
            time: utils.formatTime(time),
            pace: utils.formatPace(avgPace),
          },
          achievedTier: tierData.displayName,
          distanceM: finalDist,
          durationSec: time,
          avgPaceSec: avgPace,
          calories: Math.floor(finalDist * 0.05),
          routeCoordinates,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ [복구] 기존의 Alert 기반 종료 확인 로직
  const handleStopPress = () => {
    setIsPaused(true); // 측정 일시정지
    Alert.alert(
      "측정 중단",
      "목표 거리를 채우지 못했습니다. 중단하고 현재까지의 기록만 저장할까요?",
      [
        {
          text: "계속하기",
          onPress: () => setIsPaused(false),
          style: "cancel",
        },
        {
          text: "그만두기",
          onPress: () => handleComplete(true),
          style: "destructive",
        },
      ]
    );
  };

  return {
    state: {
      isReady,
      countdown,
      isRunning,
      isPaused,
      time,
      remainingDistance,
      distance,
      currentPace,
      routeCoordinates,
      paceHistory,
      lastLocation,
      initialLocation,
      targetDistance,
    },
    actions: {
      pauseRun: () => setIsPaused(true),
      resumeRun: () => setIsPaused(false),
      stopTierRunManual: handleStopPress, // ✅ 복구된 함수 연결
    },
    utils,
  };
};
