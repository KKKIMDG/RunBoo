// frontend/src/screens/ghost/useGhostRunScreen.ts

import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import type { GhostProfileDto } from "@/types/ghost";
import { useRecordStore } from "@/stores/recordStore";
import {
  toIsoPlus9,
  useCadence,
  useRunTimer,
  makeStartLocationTracking,
  stopBackgroundLocation,
  saveRecord,
  formatTime,
  formatPace,
} from "../running/useRunCore";

export function useGhostRunScreen() {
  useKeepAwake();

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // ✅ params에서 userId / ghost 받기
  const userId = route?.params?.userId;
  const ghost: GhostProfileDto | undefined = route?.params?.ghost;

  // 고스트 기준값 (fallback 포함)
  const ghostTotalDistanceM = (ghost?.targetDistanceKm ?? 5.2) * 1000;
  const ghostAvgPaceSec = ghost?.avgPace ?? 280; // sec/km

  // Store 구독 (일반 러닝/티어 러닝과 공유)
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

  // UI 갱신용 시간 / 차트용 히스토리는 공통 훅에서 제공
  const { pushCadenceSample, resetCadenceAgg, avgCadence } = useCadence();
  const { displayTime, paceHistory: paceHistoryMin } = useRunTimer(
    isRunning,
    isPaused,
    startTime,
    pausedTime,
    currentPace
  );
  // 고스트 진행거리(시간 기반)
  const ghostDistanceM = isRunning
    ? Math.min(ghostTotalDistanceM, (displayTime / ghostAvgPaceSec) * 1000)
    : 0;

  // (+)면 내가 뒤처짐, (-)면 내가 앞섬
  const diffM = ghostDistanceM - distance;

  // progress (0~1)
  const progress =
    ghostTotalDistanceM > 0
      ? Math.max(0, Math.min(1, distance / ghostTotalDistanceM))
      : 0;

  // 페이스 비교(+)면 내가 느림, (-)면 내가 빠름
  const paceDiffSec = (currentPace || 0) - ghostAvgPaceSec;

  // 유틸
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${
      s < 10 ? "0" + s : s
    }`;
  };

  const formatPace = (paceSec: number) => {
    if (!paceSec || !isFinite(paceSec)) return `-'--"`;
    const m = Math.floor(paceSec / 60);
    const s = Math.floor(paceSec % 60);
    return `${m}'${s < 10 ? "0" + s : s}"`;
  };

  const formatDiffBadge = (m: number) => {
    const abs = Math.abs(Math.round(m));
    if (abs < 1) return "🔥 거의 동일";
    return m > 0 ? `🔥 ${abs}m 뒤처짐` : `🔥 ${abs}m 앞섬`;
  };

  const formatPaceDiff = (sec: number) => {
    const abs = Math.abs(Math.round(sec));
    if (!isFinite(abs) || abs === 0) return "고스트와 페이스 동일";
    return sec > 0 ? `고스트보다 ${abs}초 느림` : `고스트보다 ${abs}초 빠름`;
  };

  // 1) 초기화
  useEffect(() => {
    (async () => {
      resetStore();
      resetCadenceAgg();

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      updateLocation(loc);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 카운트다운 (✅ 음성은 여기서 절대 호출하지 않음)
  useEffect(() => {
    if (isReady && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (isReady && countdown === 0) {
      // ✅ 시작 음성은 GhostRunScreen.tsx에서만 처리
      resetCadenceAgg();
      startStoreRun();
      startLocationTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, countdown]);

  // 타이머 및 그래프는 공통 훅에서 처리합니다 (displayTime, paceHistoryMin 제공)

  const startLocationTracking = makeStartLocationTracking(
    "RunBoo Ghost Challenge",
    "고스트와 대결 중입니다."
  );

  // ✅ 저장 (✅ 100m 미만 안내는 "음성"이 아니라 Alert만)
  const stopRun = async () => {
    const finalDistance = distance;
    const finalRouteCoordinates = routeCoordinates;
    const finalStartTime = startTime;
    const finalDisplayTime = displayTime;

    // 타이머 및 백그라운드 중단
    await stopBackgroundLocation();

    // ✅ 100m 미만: 저장 안 함 + Alert + 뒤로가기
    if (finalDistance < 100) {
      stopStoreRun();

      Alert.alert(
        "기록 저장 불가",
        "100m 미만의 활동은 고스트 대결 기록으로 저장되지 않습니다.",
        [{ text: "확인", onPress: () => navigation.goBack() }]
      );
      return;
    }

    const avgPaceSec =
      finalDistance > 0 ? finalDisplayTime / (finalDistance / 1000) : 0;
    const calories = Math.floor(finalDistance * 0.05);

    const finalUserId = userId ? Number(userId) : 0;
    if (!finalUserId) {
      stopStoreRun();

      Alert.alert(
        "오류",
        "userId가 없습니다. (GhostRun으로 이동할 때 userId를 params로 넘겨야 합니다.)"
      );

      navigation.navigate("RunResult", {
        distanceM: finalDistance,
        durationSec: finalDisplayTime,
        avgPaceSec,
        calories,
        routeCoordinates: finalRouteCoordinates,
        recordId: undefined,
      });
      return;
    }

    try {
      await saveRecord({
        userId: finalUserId,
        mode: "GHOST",
        distanceM: Math.floor(finalDistance),
        durationSec: finalDisplayTime,
        avgPaceSec: Math.floor(avgPaceSec),
        calories,
        cadence: avgCadence(),
        routeCoordinates: finalRouteCoordinates,
        startedAtIso: finalStartTime
          ? toIsoPlus9(new Date(finalStartTime))
          : undefined,
        endedAtIso: toIsoPlus9(new Date()),
      });
    } catch (error: any) {
      console.error("Ghost save error:", error);
      Alert.alert(
        "저장 실패",
        `기록을 저장하지 못했습니다. (${error?.message || "네트워크 에러"})`
      );
    }

    // ✅ 스토어 정리
    stopStoreRun();

    navigation.navigate("RunResult", {
      distanceM: finalDistance,
      durationSec: finalDisplayTime,
      avgPaceSec,
      calories,
      routeCoordinates: finalRouteCoordinates,
      recordId: undefined,
    });
  };

  return {
    state: {
      ghost,
      isReady,
      countdown,
      isRunning,
      isPaused,
      time: displayTime,
      distanceM: distance,
      currentPaceSec: currentPace,
      routeCoordinates,
      paceHistoryMin,
      ghostDistanceM,
      diffM,
      progress,
      paceDiffSec,
      ghostTotalDistanceM,
      ghostAvgPaceSec,
    },
    actions: {
      pauseRun: pauseStoreRun,
      resumeRun: resumeStoreRun,
      stopRun,

      // ✅ GhostRunScreen에서 cadence 샘플 주입
      pushCadenceSample,
    },
    utils: { formatTime, formatPace, formatDiffBadge, formatPaceDiff },
  };
}
