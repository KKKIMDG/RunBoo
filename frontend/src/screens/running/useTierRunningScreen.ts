import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { evaluateTier } from "@/services/tier/tierService";
import { createRecord } from "@/services/record/recordsService"; // ✅ 서비스 임포트
import type { TierData, TierEvaluationRequest } from "@/types/tier";

type TierRunningRouteProp = RouteProp<RootStackParamList, "TierRunning">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useTierRunningScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TierRunningRouteProp>();

  // ✅ 파라미터에서 userId 확보
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

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
      if (p === 0 || !isFinite(p)) return "-'--\"";
      const m = Math.floor(p / 60);
      const s = Math.floor(p % 60);
      return `${m}'${s < 10 ? "0" + s : s}"`;
    },
  };

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
          if (distance > 0) {
            const pace = next / (distance / 1000);
            setCurrentPace(pace);
            if (next % 5 === 0)
              setPaceHistory((prevH) => [...prevH, pace / 60]);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, countdown, isRunning, isPaused, distance]);

  useEffect(() => {
    const remain = targetDistance - distance;
    setRemainingDistance(remain > 0 ? remain : 0);

    // 테스트용: 10미터 도달 시 완료
    if (isRunning && distance >= 10) {
      handleComplete();
    }
  }, [distance, isRunning]);

  const handleComplete = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    locationSub.current?.remove();

    const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;
    const calories = Math.floor(distance * 0.05);

    try {
      // ✅ [DEBUG] 전송 데이터 구성
      const requestData = {
        userId: userId ? Number(userId) : 0,
        mode: "TIER" as const,
        distanceM: Math.floor(distance),
        durationSec: time,
        avgPace: Math.floor(avgPaceSec),
        calories,
        routePolyline: encodePath(routeCoordinates),
        startedAt: new Date(Date.now() - time * 1000).toISOString(),
        endedAt: new Date().toISOString(),
      };

      console.log(
        "🚀 [DEBUG] 티어 기록 저장 요청 전송 데이터:",
        JSON.stringify(requestData, null, 2)
      );

      // 1. 서버 기록 저장 (recordService를 통해 인증 헤더 자동 주입)
      await createRecord(requestData);

      // ✅ 요청하신 대로 테스트를 위해 recordId는 192로 고정 *********테스트를 위해 기록 더미로 넣어놓음 **********
      const finalRecordId = 250;
      const distanceTypeKey = "10k";
      console.log("✅ [DEBUG] 테스트용 고정 recordId 사용:", finalRecordId);
      console.log("✅ [DEBUG] 테스트용 고정 recordId 사용:", distanceTypeKey);

      // 2. 티어 평가 요청
      const evaluationReq: TierEvaluationRequest = {
        recordId: finalRecordId,
        distanceType: distanceTypeKey,
      };

      const tierData: TierData = await evaluateTier(evaluationReq);

      Alert.alert("알림", "측정이 완료되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            navigation.navigate("TierResult", {
              userId,
              recordId: finalRecordId,
              distanceType: distanceTypeKey,
              stats: {
                distance: (distance / 1000).toFixed(2),
                time: utils.formatTime(time),
                pace: utils.formatPace(avgPaceSec),
              },
              achievedTier: tierData.displayName,
              distanceM: distance,
              durationSec: time,
              avgPaceSec,
              calories,
              routeCoordinates,
            });
          },
        },
      ]);
    } catch (e) {
      console.error("❌ 데이터 처리 오류:", e);
      Alert.alert("오류", "서버 전송에 실패했습니다.");
      navigation.goBack();
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setRouteCoordinates((prev) => {
          if (prev.length > 0) {
            const d = getDistance(
              prev[prev.length - 1].latitude,
              prev[prev.length - 1].longitude,
              latitude,
              longitude
            );
            if (d > 0 && d < 30) setDistance((cur) => cur + d);
          }
          return [...prev, { latitude, longitude }];
        });
      }
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
      currentPace,
      routeCoordinates,
      paceHistory,
    },
    actions: {
      pauseRun: () => setIsPaused(true),
      resumeRun: () => setIsPaused(false),
      stopTierRunManual: handleComplete,
    },
    utils,
  };
};
