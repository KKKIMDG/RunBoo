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
import { fetchUserVoiceSetting } from "@/services/user/userService";
import { UserVoiceSetting } from "@/types/userSetting";
import { useUserMe } from "@/contexts/UserMeContext";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Coordinate = { latitude: number; longitude: number };

const toIsoPlus9 = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

/** ✅ 케이던스 샘플 필터 (40~260 범위만 인정) */
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
  const { userMe } = useUserMe();

  // 유저 ID 확보 (Context 우선, 차선책 Params)
  const userId = userMe?.id || route.params?.userId;
  const targetDistance = route.params?.targetDistance ?? 0;

  // 음성 설정 상태 (Params에서 먼저 시도 후 fetch)
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ 케이던스 평균 계산용 Ref
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
      return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${sec < 10 ? "0" + sec : sec}`;
    },
    formatPace: (p: number) => {
      if (p === 0 || !isFinite(p) || p > 3600) return "-'--\"";
      const m = Math.floor(p / 60);
      const s = Math.floor(p % 60);
      return `${m}'${s < 10 ? "0" + s : s}"`;
    },
  };

  // 1. 초기 진입: 초기화 및 권한 확인
  useEffect(() => {
    (async () => {
      resetStore();
      resetCadenceAgg();

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert("위치 권한 필요", "러닝 기록을 위해 위치 권한이 필요합니다.");
          return;
      }

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

  // 2. 서버에서 유저 음성 설정 가져오기 (Params에 값이 없을 때만 혹은 최신화용)
  useEffect(() => {
    (async () => {
      try {
        const userVoice: UserVoiceSetting = await fetchUserVoiceSetting();
        // Params에 값이 없었던 경우에만 서버값으로 덮어씀 (선택 사항)
        if (voiceSetting === undefined) {
            setIsVoiceEnabled(userVoice.voiceGuideEnabled);
            setIsMale(userVoice.voiceType === "MALE");
        }
      } catch (e) {
        console.warn("Failed to fetch user voice setting", e);
      }
    })();
  }, []);

  // 3. 카운트다운 -> 시작 로직
  useEffect(() => {
    if (isReady && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isReady && countdown === 0) {
      resetCadenceAgg(); // 시작 직전 케이던스 누적치 초기화
      startStoreRun();
      startLocationTracking();
    }
  }, [isReady, countdown]);

  // 4. 러닝 중 타이머 및 페이스 기록
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

  // ✅ 통합된 stopRun: 평균 케이던스 포함 및 ID 확보
  const stopRun = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    stopStoreRun();
    if (timerRef.current) clearInterval(timerRef.current);

    // 100m 미만 저장 방지
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
      cadence: avgCadence(), // 누적된 샘플의 평균값
      routePolyline: encodePath(routeCoordinates),
      startedAt: startTime ? toIsoPlus9(new Date(startTime)) : new Date().toISOString(),
      endedAt: toIsoPlus9(new Date()),
    };

    let recordId: number | undefined = undefined;
    try {
      const response = await createRecord(requestData);
      // API가 생성된 객체를 반환한다면 직접 ID 확보
      recordId = response?.id;

      // 만약 response에 ID가 없다면 목록에서 최신 ID 조회 (Fallback)
      if (!recordId) {
          const records = await fetchMyRecords();
          if (records?.length) {
            recordId = Math.max(...records.map((r: any) => Number(r.id)));
          }
      }
    } catch (e) {
      console.error("기록 저장 실패:", e);
    }

    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: displayTime,
      avgPaceSec,
      calories: Math.floor(distance * 0.05),
      routeCoordinates,
      recordId, // 획득한 ID 전달
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
      pushCadenceSample, // 컴포넌트에서 센서 값을 넣어주는 함수
      toggleFollowing: () => setIsFollowing(!isFollowing),
      setIsFollowing,
      onLocationUpdate,
      setIsVoiceEnabled,
      setIsMale,
    },
    utils,
  };
};