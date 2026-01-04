import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { evaluateTier } from "@/services/tier/tierService";
import { createRecord, fetchMyRecords } from "@/services/record/recordsService";
import type { TierData, TierEvaluationRequest } from "@/types/tier";

type TierRunningRouteProp = RouteProp<RootStackParamList, "TierRunning">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

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
    const remain = targetDistance - distance;
    setRemainingDistance(remain > 0 ? remain : 0);
    if (isRunning && distance >= targetDistance) {
      handleComplete(false);
    }
  }, [distance, isRunning, targetDistance]);

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

  const handleComplete = async (isStopped: boolean = false) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    locationSub.current?.remove();

    const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;
    const calories = Math.floor(distance * 0.05);

    try {
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

      // 🚀 1. 새로운 기록 저장
      await createRecord(requestData);

      // 🚀 2. 저장 직후 목록을 불러와서 '가장 큰 ID'를 방금 생성된 ID로 특정
      const records = await fetchMyRecords();
      if (!records || records.length === 0)
        throw new Error("기록을 찾을 수 없습니다.");

      // ✅ 현재 테이블 내의 Max ID가 방금 저장된 레코드의 ID입니다.
      const finalRecordId = Math.max(...records.map((r: any) => r.id));
      console.log("✅ [DEBUG] 방금 측정된 최신 Record ID:", finalRecordId);

      if (isStopped) {
        Alert.alert("알림", "측정을 중단합니다. 기록 페이지로 이동합니다.", [
          {
            text: "확인",
            onPress: () => {
              navigation.navigate("RunResult", {
                distanceM: distance,
                durationSec: time,
                avgPaceSec,
                calories,
                routeCoordinates,
              });
            },
          },
        ]);
        return;
      }

      // 완주 시 티어 평가
      const evaluationReq: TierEvaluationRequest = {
        recordId: finalRecordId,
        distanceType: distanceTypeKey,
      };
      const tierData: TierData = await evaluateTier(evaluationReq);

      Alert.alert("알림", "목표 거리에 도달하여 측정을 완료합니다!", [
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
      console.error("❌ 처리 오류:", e);
      Alert.alert("오류", "데이터 처리 중 문제가 발생했습니다.");
    }
  };

  const handleStopPress = () => {
    setIsPaused(true);
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
      stopTierRunManual: handleStopPress,
    },
    utils,
  };
};
