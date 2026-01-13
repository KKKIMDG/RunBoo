import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import type { RootStackParamList } from "@/navigation/root/RootNavigator";
import { useRecordStore } from "@/stores/recordStore";
import { fetchUserVoiceSetting } from "@/services/user/userService";
import { UserVoiceSetting } from "@/types/userSetting";
import { useUserMe } from "@/contexts/UserMeContext";
import {
  toIsoPlus9,
  useCadence,
  useRunTimer,
  makeStartLocationTracking,
  stopBackgroundLocation,
  saveRecord,
  formatTime,
  formatPace,
  useMapFocusing,
} from "./useRunCore";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Coordinate = { latitude: number; longitude: number };

export const useRunningScreen = () => {
  useKeepAwake();
  const navigation = useNavigation<RunningScreenNavigationProp>();
  const route = useRoute<RunningScreenRouteProp>();
  const { userMe } = useUserMe();

  // 유저 ID 확보 (Context 우선, 차선책 Params)
  const userId = userMe?.userId;
  const targetDistance = route.params?.targetDistance ?? 0;

  // 음성 설정 상태 (Params에서 먼저 시도 후 fetch)
  const voiceGuideEnabled = route.params?.voiceGuideEnabled;
  const voiceType = route.params?.voiceType;
  const [isMale, setIsMale] = useState(voiceType === "MALE");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(
    voiceGuideEnabled ?? true
  );

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

  const [initialLocation, setInitialLocation] = useState<Coordinate | null>(
    null
  );

  const { pushCadenceSample, resetCadenceAgg, avgCadence } = useCadence();
  const { displayTime, paceHistory } = useRunTimer(
    isRunning,
    isPaused,
    startTime,
    pausedTime,
    currentPace
  );

  const utils = {
    formatTime,
    formatPace,
  };

  // 1. 초기 진입: 초기화 및 권한 확인
  useEffect(() => {
    (async () => {
      console.log("[useRunningScreen] Initializing...");
      resetStore();
      resetCadenceAgg();

      console.log("[useRunningScreen] Requesting location permissions");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("[useRunningScreen] Location permission denied");
        Alert.alert(
          "위치 권한 필요",
          "러닝 기록을 위해 위치 권한이 필요합니다."
        );
        return;
      }
      console.log("[useRunningScreen] Location permission granted");

      console.log("[useRunningScreen] Getting current position");
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      console.log("[useRunningScreen] Current position:", loc.coords);

      setInitialLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      console.log("[useRunningScreen] Initial location set");

      updateLocation(loc);
      console.log("[useRunningScreen] Initialization complete");
    })();
  }, []);

  // 2. 서버에서 유저 음성 설정 가져오기 (Params에 값이 없을 때만 혹은 최신화용)
  useEffect(() => {
    (async () => {
      try {
        console.log("[useRunningScreen] Fetching voice settings from server");
        const userVoice: UserVoiceSetting = await fetchUserVoiceSetting();
        console.log("[useRunningScreen] Voice settings:", userVoice);
        // Params에 값이 없었던 경우에만 서버값으로 덮어씀 (선택 사항)
        if (voiceGuideEnabled === undefined) {
          console.log("[useRunningScreen] Applying voice settings from server");
          setIsVoiceEnabled(userVoice.voiceGuideEnabled);
          setIsMale(userVoice.voiceType === "MALE");
        }
      } catch (e) {
        console.warn(
          "[useRunningScreen] Failed to fetch user voice setting",
          e
        );
      }
    })();
  }, []);

  // 3. 카운트다운 -> 시작 로직
  useEffect(() => {
    if (isReady && countdown > 0) {
      console.log(`[useRunningScreen] Countdown: ${countdown}`);
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isReady && countdown === 0) {
      console.log("[useRunningScreen] Countdown complete, starting run");
      resetCadenceAgg(); // 시작 직전 케이던스 누적치 초기화
      startStoreRun();
      startLocationTracking();
      console.log("[useRunningScreen] Run started");
    }
  }, [isReady, countdown]);

  // 타이머 및 페이스 기록은 공통 훅(useRunTimer)에서 처리합니다.

  const startLocationTracking = makeStartLocationTracking(
    "RunBoo Running",
    "러닝 기록을 측정 중입니다."
  );

  // ✅ 통합된 stopRun: 평균 케이던스 포함 및 ID 확보
  const stopRun = async () => {
    console.log("[useRunningScreen] Stopping run...");
    await stopBackgroundLocation();

    stopStoreRun();
    console.log("[useRunningScreen] Store run stopped");

    const avgPaceSec = distance > 0 ? displayTime / (distance / 1000) : 0;
    const calories = Math.floor(distance * 0.05);
    console.log("[useRunningScreen] Calculated stats:", {
      avgPaceSec,
      calories,
      avgCadence: avgCadence(),
      distance,
      displayTime,
    });

    let recordId: number | undefined = undefined;
    try {
      console.log("[useRunningScreen] Saving record to server...");
      const { recordId: rid } = await saveRecord({
        userId: userId ? Number(userId) : 0,
        mode: "NORMAL",
        distanceM: Math.floor(distance),
        durationSec: displayTime,
        avgPaceSec,
        calories,
        cadence: avgCadence(),
        routeCoordinates,
        startedAtIso: startTime ? toIsoPlus9(new Date(startTime)) : undefined,
        endedAtIso: toIsoPlus9(new Date()),
      });
      recordId = rid;
      console.log("[useRunningScreen] Record saved successfully:", recordId);
    } catch (e) {
      console.error("[useRunningScreen] 기록 저장 실패:", e);
    }

    console.log("[useRunningScreen] Navigating to RunResult");
    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: displayTime,
      avgPaceSec,
      calories,
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
      initialLocation,
      isVoiceEnabled,
      isMale,
    },
    actions: {
      pauseRun: pauseStoreRun,
      resumeRun: resumeStoreRun,
      stopRun,
      pushCadenceSample,
      setIsVoiceEnabled,
      setIsMale,
    },
    utils,
  };
};
