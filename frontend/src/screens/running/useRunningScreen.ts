import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { createRecord } from "@/services/record/recordsService"; // ✅ 공통 서비스 사용

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const useRunningScreen = () => {
  useKeepAwake();

  const navigation = useNavigation<RunningScreenNavigationProp>();
  const route = useRoute<RunningScreenRouteProp>();

  // ✅ 내비게이션 파라미터에서 userId 추출
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

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 유틸리티 함수 ---
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${
      s < 10 ? "0" + s : s
    }`;
  };

  const formatPace = (paceInSeconds: number) => {
    if (paceInSeconds === 0 || !isFinite(paceInSeconds)) return "-'--\"";
    const m = Math.floor(paceInSeconds / 60);
    const s = Math.floor(paceInSeconds % 60);
    return `${m}'${s < 10 ? "0" + s : s}"`;
  };

  // --- 카운트다운 로직 ---
  useEffect(() => {
    if (isReady && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isReady && countdown === 0) {
      setIsReady(false);
      setIsRunning(true);
      startLocationTracking();
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [isReady, countdown]);

  // --- 타이머 및 페이스 계산 로직 ---
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          if (distance > 0) {
            const newPace = newTime / (distance / 1000);
            setCurrentPace(newPace);
            if (newTime % 5 === 0) {
              setPaceHistory((prev) => [...prev, newPace / 60]);
            }
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, distance]);

  // --- 위치 추적 시작 ---
  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 거부", "위치 권한이 필요합니다.");
      return;
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        const { latitude, longitude } = newLocation.coords;
        setRouteCoordinates((prevRoute) => {
          if (prevRoute.length > 0) {
            const lastPoint = prevRoute[prevRoute.length - 1];
            const dist = getDistance(
              lastPoint.latitude,
              lastPoint.longitude,
              latitude,
              longitude
            );
            if (dist > 0 && dist < 30) {
              setDistance((prevDist) => prevDist + dist);
            }
          }
          return [...prevRoute, { latitude, longitude }];
        });
      }
    );
  };

  // --- 러닝 종료 및 데이터 저장 ---
  const stopRun = async () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    locationSubscription.current?.remove();

    const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;
    const calories = Math.floor(distance * 0.05);

    // ✅ [DEBUG] 서버 전송 데이터 조립
    const requestData = {
      userId: userId ? Number(userId) : 0, // 파라미터 ID를 숫자로 변환
      mode: "NORMAL" as const,
      distanceM: Math.floor(distance),
      durationSec: time,
      avgPace: Math.floor(avgPaceSec),
      calories: calories,
      routePolyline: encodePath(routeCoordinates),
      startedAt: new Date(Date.now() - time * 1000).toISOString(),
      endedAt: new Date().toISOString(),
    };

    // ✅ [DEBUG] 콘솔 로그 출력 (여기서 userId를 꼭 확인하세요!)
    console.log("=========================================");
    console.log("🚀 [DEBUG] 기록 저장 요청 전송 데이터:");
    console.log(JSON.stringify(requestData, null, 2));
    console.log("=========================================");

    try {
      // ✅ recordService를 통해 저장 (api.ts가 토큰을 자동으로 붙여줌)
      const response = await createRecord(requestData);
      console.log("✅ [DEBUG] 서버 응답:", response);
    } catch (error: any) {
      console.error("❌ [DEBUG] 저장 실패 에러:", error);
      Alert.alert(
        "저장 실패",
        `기록을 저장하지 못했습니다. (${error.message || "네트워크 에러"})`
      );
    }

    // 결과 화면으로 이동
    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: time,
      avgPaceSec: avgPaceSec,
      calories: calories,
      routeCoordinates: routeCoordinates,
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
    },
    actions: {
      pauseRun: () => setIsPaused(true),
      resumeRun: () => setIsPaused(false),
      stopRun,
    },
    utils: { formatTime, formatPace },
  };
};
