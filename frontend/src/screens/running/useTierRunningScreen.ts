import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { Coordinate } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { evaluateTier } from "@/services/tier/tierService";
import { useRecordStore } from "@/stores/recordStore";
import { useKeepAwake } from "expo-keep-awake";
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
} from "./useRunCore";

type TierRunningRouteProp = RouteProp<RootStackParamList, "TierRunning">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

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
  }, []);

  // 2. 백그라운드 트래킹 시작
  const startLocationTracking = makeStartLocationTracking(
    "RunBoo Tier Challenge",
    "티어 측정 중입니다. 힘내세요!"
  );

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

  // 타이머 및 페이스 기록은 공통 훅(useRunTimer)에서 처리합니다.

  // ✅ 완료 처리 (정상 종료 / 중단 종료)
  const handleComplete = async (isStopped: boolean = false) => {
    await stopBackgroundLocation();

    stopStoreRun();

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

    try {
      const { recordId: finalRecordId } = await saveRecord({
        userId: userId ? Number(userId) : 0,
        mode: "TIER",
        distanceM: Math.floor(finalDist),
        durationSec: displayTime,
        avgPaceSec: avgPaceSec,
        calories: Math.floor(finalDist * 0.05),
        cadence: currentAvgCadence,
        routeCoordinates,
        startedAtIso: startTime ? toIsoPlus9(new Date(startTime)) : undefined,
        endedAtIso: toIsoPlus9(new Date()),
      });

      if (isStopped) {
        // 중도 포기 -> 일반 결과 화면
        navigation.navigate("RunResult", {
          distanceM: finalDist,
          durationSec: displayTime,
          avgPaceSec,
          calories: Math.floor(finalDist * 0.05),
          routeCoordinates,
          recordId: finalRecordId ?? 0,
          cadenceSpm: currentAvgCadence, // 결과 화면 표시용
        });
      } else {
        // 목표 달성 -> 티어 평가 및 결과 화면
        const tierData = await evaluateTier({
          recordId: finalRecordId ?? 0,
          distanceType: distanceTypeKey,
        });

        navigation.navigate("TierResult", {
          userId,
          recordId: finalRecordId ?? 0,
          distanceType: distanceTypeKey,
          stats: {
            distance: (finalDist / 1000).toFixed(2),
            time: formatTime(displayTime),
            pace: formatPace(avgPaceSec),
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
