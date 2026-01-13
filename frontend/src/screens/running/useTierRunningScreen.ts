import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { Coordinate, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { evaluateTier } from "@/services/tier/tierService";
import { createRecord, fetchMyRecords } from "@/services/record/recordsService";
import { useRecordStore } from "@/stores/recordStore";
import { LOCATION_TASK_NAME } from "@/services/record/locationTask";
import { useKeepAwake } from "expo-keep-awake";
import { useUserMe } from "@/contexts/UserMeContext";

type TierRunningRouteProp = RouteProp<RootStackParamList, "TierRunning">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const toIsoPlus9 = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

/** ✅ 케이던스 샘플 필터 (40~260 범위) */
function normalizeCadence(spm: number): number | null {
  const v = Number(spm);
  if (!Number.isFinite(v)) return null;
  const r = Math.round(v);
  if (r < 40 || r > 260) return null;
  return r;
}

export const useTierRunningScreen = () => {
  useKeepAwake();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TierRunningRouteProp>();
  const { userMe } = useUserMe();

  const userId = userMe?.userId;
  const targetDistance = route.params?.targetDistance ?? 5000;
  const distanceTypeKey: "5k" | "10k" = targetDistance <= 5000 ? "5k" : "10k";

  const {
    isReady,
    countdown,
    isRunning,
    isPaused,
    distance,
    currentPace,
    routeCoordinates,
    startTime,
    pausedTime,
    setCountdown,
    startRun: startStoreRun,
    pauseRun: pauseStoreRun,
    resumeRun: resumeStoreRun,
    stopRun: stopStoreRun,
    reset: resetStore,
    currentLocation,
    updateLocation,
  } = useRecordStore();

  const [remainingDistance, setRemainingDistance] = useState(targetDistance);
  const [paceHistory, setPaceHistory] = useState<number[]>([]);
  const [initialLocation, setInitialLocation] = useState<Coordinate | null>(
    null
  );
  const [displayTime, setDisplayTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ 케이던스 평균 누적을 위한 Ref (dev 브랜치 방식)
  const cadenceSumRef = useRef(0);
  const cadenceCountRef = useRef(0);

  const pushCadenceSample = (spm: number) => {
    const v = normalizeCadence(spm);
    if (v == null) return;
    cadenceSumRef.current += v;
    cadenceCountRef.current += 1;
  };

  const resetCadenceAgg = () => {
    cadenceSumRef.current = 0;
    cadenceCountRef.current = 0;
  };

  const avgCadence = () => {
    const n = cadenceCountRef.current;
    if (n <= 0) return 0;
    return Math.round(cadenceSumRef.current / n);
  };

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

  // 1. 초기화
  useEffect(() => {
    (async () => {
      resetStore();
      resetCadenceAgg();

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setInitialLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      updateLocation(loc);
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. 백그라운드 트래킹 시작
  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: "RunBoo Tier Challenge",
        notificationBody: "티어 측정 중입니다. 힘내세요!",
        notificationColor: "#4A6EA9",
      },
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
    });
  };

  // 3. 거리 계산 및 자동 종료 체크
  useEffect(() => {
    const remain = targetDistance - distance;
    setRemainingDistance(remain > 0 ? remain : 0);

    if (isRunning && distance >= targetDistance) {
      handleComplete(false); // 목표 도달 시 자동 종료
    }
  }, [distance, isRunning, targetDistance]);

  // 4. 카운트다운 및 시작
  useEffect(() => {
    if (isReady && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (isReady && countdown === 0) {
      resetCadenceAgg();
      startStoreRun();
      startLocationTracking();
    }
  }, [isReady, countdown]);

  // 5. 타이머 및 페이스 기록
  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
        const currentSec = durationSec >= 0 ? durationSec : 0;
        setDisplayTime(currentSec);

        if (currentSec % 5 === 0 && currentPace > 0) {
          setPaceHistory((prev) => [...prev, currentPace / 60]);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, startTime, pausedTime, currentPace]);

  // ✅ 완료 처리 (정상 종료 / 중단 종료)
  const handleComplete = async (isStopped: boolean = false) => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    stopStoreRun();
    if (timerRef.current) clearInterval(timerRef.current);

    // 100m 미만 기록 방지
    if (distance < 100) {
      Alert.alert(
        "기록 저장 불가",
        "100m 미만의 활동은 측정 기록으로 인정되지 않습니다.",
        [{ text: "확인", onPress: () => navigation.goBack() }]
      );
      return;
    }

    const finalDist = Math.min(distance, targetDistance);
    const avgPaceSec = finalDist > 0 ? displayTime / (finalDist / 1000) : 0;
    const currentAvgCadence = avgCadence(); // 최종 평균 케이던스 산출

    const data = {
      userId: userId ? Number(userId) : 0,
      mode: "TIER" as const,
      distanceM: Math.floor(finalDist),
      durationSec: displayTime,
      avgPace: Math.floor(avgPaceSec),
      calories: Math.floor(finalDist * 0.05),
      cadence: currentAvgCadence, // 서버 저장용
      routePolyline: encodePath(routeCoordinates),
      startedAt: startTime
        ? toIsoPlus9(new Date(startTime))
        : new Date().toISOString(),
      endedAt: toIsoPlus9(new Date()),
    };

    try {
      const response = await createRecord(data);

      // recordId 확보 로직
      let finalRecordId = response?.id;
      if (!finalRecordId) {
        const records = await fetchMyRecords();
        finalRecordId = Math.max(...records.map((r: any) => Number(r.id)));
      }

      if (isStopped) {
        // 중도 포기 -> 일반 결과 화면
        navigation.navigate("RunResult", {
          distanceM: finalDist,
          durationSec: displayTime,
          avgPaceSec,
          calories: Math.floor(finalDist * 0.05),
          routeCoordinates,
          recordId: finalRecordId,
          cadenceSpm: currentAvgCadence, // 결과 화면 표시용
        });
      } else {
        // 목표 달성 -> 티어 평가 및 결과 화면
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
            time: utils.formatTime(displayTime),
            pace: utils.formatPace(avgPaceSec),
          },
          achievedTier: tierData.displayName,
          distanceM: finalDist,
          durationSec: displayTime,
          avgPaceSec,
          calories: Math.floor(finalDist * 0.05),
          routeCoordinates,
          cadenceSpm: currentAvgCadence, // 결과 화면 표시용
        });
      }
    } catch (e) {
      console.error("Tier Complete Error:", e);
      Alert.alert("저장 오류", "기록 저장 중 문제가 발생했습니다.");
    }
  };

  // ✅ 중단 버튼 처리
  const handleStopPress = () => {
    pauseStoreRun();
    Alert.alert(
      "측정 중단",
      "목표 거리를 채우지 못했습니다. 중단하고 현재까지의 기록만 저장할까요?",
      [
        { text: "계속하기", onPress: () => resumeStoreRun(), style: "cancel" },
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
      time: displayTime,
      remainingDistance,
      distance,
      currentPace,
      routeCoordinates,
      paceHistory,
      lastLocation: currentLocation,
      initialLocation,
      targetDistance,
    },
    actions: {
      pauseRun: pauseStoreRun,
      resumeRun: resumeStoreRun,
      stopTierRunManual: handleStopPress,
      pushCadenceSample, // Screen에서 센서 데이터를 넣어주는 함수
    },
    utils,
  };
};
