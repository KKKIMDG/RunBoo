import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { encodePath } from "@/utils/runUtils";
import type { RootStackParamList } from "@/navigation/root/RootNavigator";
import { createRecord, fetchMyRecords } from "@/services/record/recordsService";
import { useRecordStore } from "@/stores/recordStore";
import { LOCATION_TASK_NAME } from "@/services/record/locationTask";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Coordinate = { latitude: number; longitude: number };

const toIsoPlus9 = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

// ✅ 케이던스 샘플 필터
function normalizeCadence(spm: number): number | null {
  const v = Number(spm);
  if (!Number.isFinite(v)) return null;
  const r = Math.round(v);
  if (r < 40 || r > 260) return null;
  return r;
}

export const useRunningScreen = () => {
  useKeepAwake();
  const navigation = useNavigation<RunningScreenNavigationProp>();
  const route = useRoute<RunningScreenRouteProp>();

  const userId = route?.params?.userId;
  const targetDistance = route.params?.targetDistance ?? 0;

  const voiceSetting = route.params?.userVoiceSetting;
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(
    voiceSetting?.voiceEnabled ?? true
  );
  const [isMale, setIsMale] = useState(voiceSetting?.voiceType === "MALE");

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
    updateLocation,
  } = useRecordStore();

  const [isFollowing, setIsFollowing] = useState(true);
  const [initialLocation, setInitialLocation] = useState<Coordinate | null>(null);
  const [displayTime, setDisplayTime] = useState(0);
  const [paceHistory, setPaceHistory] = useState<number[]>([]);

  const onLocationUpdate = useRef<((coords: Coordinate) => void) | null>(null);

  // ✅ RN/Expo에선 NodeJS.Timeout보다 이 타입이 안전함
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ 케이던스 평균용 누적
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

  // ✅ 초기 진입: 스토어/케이던스 리셋 + 초기 위치 잡기
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

  // ✅ 카운트다운 -> 시작
  useEffect(() => {
    if (isReady && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isReady && countdown === 0) {
      resetCadenceAgg(); // ✅ 시작 직전 리셋
      startStoreRun();
      startLocationTracking();
    }
  }, [isReady, countdown]);

  // ✅ 러닝 중 타이머 + paceHistory
  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
        const currentSec = durationSec >= 0 ? durationSec : 0;
        setDisplayTime(currentSec);

        if (currentSec > 0 && currentSec % 5 === 0 && currentPace > 0) {
          setPaceHistory((prev) => [...prev, currentPace / 60]);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, startTime, pausedTime, currentPace]);

  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: "RunBoo Running",
        notificationBody: "러닝 기록을 측정 중입니다.",
        notificationColor: "#4A6EA9",
      },
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
    });
  };

  // ✅ stopRun은 인자 없음 (케이던스는 평균으로 저장)
  const stopRun = async () => {
    // 1) 백그라운드 작업 즉시 중단
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    stopStoreRun();
    if (timerRef.current) clearInterval(timerRef.current);

    // ✅ 100m 미만이면 저장 안 하고 종료
    if (distance < 100) {
      Alert.alert(
        "기록 저장 불가",
        "100m 미만의 활동은 기록으로 저장되지 않습니다.",
        [{ text: "확인", onPress: () => navigation.goBack() }]
      );
      return;
    }

    const avgPaceSec = distance > 0 ? displayTime / (distance / 1000) : 0;

    const requestData = {
      userId: userId ? Number(userId) : 0,
      mode: "NORMAL" as const,
      distanceM: Math.floor(distance),
      durationSec: displayTime,
      avgPace: Math.floor(avgPaceSec),
      calories: Math.floor(distance * 0.05),

      // ✅ 평균 케이던스 저장
      cadence: avgCadence(),

      routePolyline: encodePath(routeCoordinates),
      startedAt: startTime
        ? toIsoPlus9(new Date(startTime))
        : new Date().toISOString(),
      endedAt: toIsoPlus9(new Date()),
    };

    try {
      await createRecord(requestData);
    } catch (e) {
      console.error(e);
    }

    // ✅ recordId 확보 후 RunResult로 전달 (케이던스는 전달 안 함)
    let recordId: number | undefined = undefined;
    try {
      const records = await fetchMyRecords();
      if (records?.length) {
        recordId = Math.max(...records.map((r: any) => Number(r.id)));
      }
    } catch {}

    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: displayTime,
      avgPaceSec,
      calories: Math.floor(distance * 0.05),
      routeCoordinates,
      recordId,
    });
  };

  return {
    state: {
      isReady,
      countdown,
      isRunning,
      isPaused,
      time: displayTime,
      distance,
      currentPace,
      routeCoordinates,
      paceHistory,
      targetDistance,
      isFollowing,
      initialLocation,
      isVoiceEnabled,
      isMale,
    },
    actions: {
      pauseRun: pauseStoreRun,
      resumeRun: resumeStoreRun,
      stopRun,

      // ✅ RunningScreen에서 cadence 샘플 넣는 함수
      pushCadenceSample,

      toggleFollowing: () => setIsFollowing(!isFollowing),
      setIsFollowing,
      onLocationUpdate,
      setIsVoiceEnabled,
      setIsMale,
    },
    utils,
  };
};
