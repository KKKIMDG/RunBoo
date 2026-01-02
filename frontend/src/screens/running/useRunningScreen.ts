import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";

// ▼▼▼ 1. 환경 변수 임포트 추가 ▼▼▼
import { API_BASE_URL } from "@env";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const useRunningScreen = () => {
  useKeepAwake();

  const navigation = useNavigation<RunningScreenNavigationProp>();
  const route = useRoute<RunningScreenRouteProp>();
  const targetDistance = route.params?.targetDistance ?? 0;
  // --- 상태 관리 ---
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

  // --- 유틸리티 ---
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

  // --- 로직 (Effect) ---
  useEffect(() => {
    if (isReady && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isReady && countdown === 0) {
      setIsReady(false);
      startRun();
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [isReady, countdown]);

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
        const newPoint: Coordinate = { latitude, longitude };

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
          return [...prevRoute, newPoint];
        });
      }
    );
  };

  // --- 러닝 제어 ---
  const startRun = () => {
    setIsRunning(true);
    setIsPaused(false);
    startLocationTracking();
  };

  const pauseRun = () => {
    setIsPaused(true);
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
  };

  const resumeRun = () => {
    setIsPaused(false);
    startLocationTracking();
  };

  const stopRun = async () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationSubscription.current) locationSubscription.current.remove();

    const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;
    const calories = Math.floor(distance * 0.05);

    const userIdStr = await AsyncStorage.getItem("userId");

    const requestData = {
      userId: userIdStr ? parseInt(userIdStr) : 0,
      distanceM: distance,
      durationSec: time,
      avgPace: Math.floor(avgPaceSec),
      calories: calories,
      routePolyline: encodePath(routeCoordinates),
      startedAt: new Date(Date.now() - time * 1000).toISOString(),
      endedAt: new Date().toISOString(),
    };

    console.log("LOG 저장할 데이터:", JSON.stringify(requestData));

    try {
      // ▼▼▼ 2. 환경 변수 사용으로 변경 ▼▼▼
      // .env에 정의된 API_BASE_URL (예: http://20.20.10.37:8080) 사용
      const url = `${API_BASE_URL}/api/records`;

      console.log("전송 URL:", url); // 디버깅용 로그

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        console.log("✅ DB 저장 성공!");
      } else {
        console.error("❌ DB 저장 실패:", await response.text());
        Alert.alert("저장 실패", "서버에 기록을 저장하지 못했습니다.");
      }
    } catch (error) {
      console.error("❌ 네트워크 에러:", error);
      Alert.alert("에러", "서버와 연결할 수 없습니다.");
    }

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
    actions: { pauseRun, resumeRun, stopRun },
    utils: { formatTime, formatPace },
  };
};
