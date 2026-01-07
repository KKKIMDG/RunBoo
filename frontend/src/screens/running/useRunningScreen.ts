import { useState, useEffect, useRef } from "react";
import { Alert, Linking, Platform } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { Coordinate, encodePath } from "@/utils/runUtils";
import type { RootStackParamList } from "@/navigation/root/RootNavigator";
import { createRecord } from "@/services/record/recordsService";
import { useRecordStore } from "@/stores/recordStore";
import { LOCATION_TASK_NAME } from "@/services/record/locationTask";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const toIsoPlus9 = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

export const useRunningScreen = () => {
  useKeepAwake();
  const navigation = useNavigation<RunningScreenNavigationProp>();
  const route = useRoute<RunningScreenRouteProp>();

  const userId = route?.params?.userId;
  const targetDistance = route.params?.targetDistance ?? 0;

  // Store 구독
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
    setReady,
    setCountdown,
    startRun: startStoreRun,
    pauseRun: pauseStoreRun,
    resumeRun: resumeStoreRun,
    stopRun: stopStoreRun,
    reset: resetStore,
    currentLocation,
    updateLocation // 액션 가져오기
  } = useRecordStore();

  // 로컬 UI 상태 (지도 포커싱용)
  const [isFollowing, setIsFollowing] = useState(true);
  const [initialLocation, setInitialLocation] = useState<Coordinate | null>(null);
  
  // UI 갱신용 시간 (초 단위) - 백그라운드에선 멈추지만 돌아오면 startTime 기반으로 복구됨
  const [displayTime, setDisplayTime] = useState(0); 

  const onLocationUpdate = useRef<((coords: Coordinate) => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 1. 초기 위치 및 권한 (진입 시 1회)
  useEffect(() => {
    (async () => {
        resetStore(); // 들어올 때 스토어 초기화
        
        // 1. 포그라운드 권한 요청
        const { status: foreStatus } = await Location.requestForegroundPermissionsAsync();
        if (foreStatus !== "granted") {
            Alert.alert(
                "위치 권한 필요", 
                "러닝 기록을 위해 위치 권한이 필요합니다. 설정에서 '앱 사용 중 허용'을 선택해주세요.",
                [
                    { text: "취소", style: "cancel" },
                    { text: "설정으로 이동", onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }
        
        // 2. 백그라운드 권한 요청 (선택 사항이지만 권장)
        // iOS에서는 '앱 사용 중 허용' 상태에서 백그라운드 요청을 하면 '항상 허용'으로 바꾸겠냐는 팝업이 뜰 수 있음
        const { status: backStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backStatus !== "granted") {
             console.log("백그라운드 권한 거부됨 - 화면 꺼지면 기록 안 될 수 있음");
             // 여기서 강제로 막을지, 경고만 줄지는 기획에 따라 결정. 일단 경고만.
        }

        const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
        });

        // 1. 로컬 상태 업데이트 (지도 렌더링용)
        setInitialLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });

        // 2. 스토어에도 초기 위치 즉시 주입
        updateLocation(loc);

    })();
    
    // 언마운트 시 클린업
    return () => {
        // 화면 나가면 스톱? (보통은 여기서 스톱 안 하고 명시적 종료 버튼 눌러야 함)
        // 하지만 개발 중 편의를 위해 일단 놔둠
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. 카운트다운 로직
  useEffect(() => {
    if (isReady && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isReady && countdown === 0) {
      startStoreRun(); // 스토어 상태 변경
      startLocationTracking(); // 백그라운드 추적 시작
    }
  }, [isReady, countdown]);

  // 3. 타이머 UI 갱신 (1초마다)
  useEffect(() => {
    if (isRunning && !isPaused && startTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        // (현재시간 - 시작시간 - 일시정지시간) / 1000
        const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
        setDisplayTime(durationSec >= 0 ? durationSec : 0);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, startTime, pausedTime]);

  // 4. 위치 업데이트 시 지도 포커싱
  useEffect(() => {
      if (currentLocation && isFollowing && onLocationUpdate.current) {
          onLocationUpdate.current(currentLocation);
      }
  }, [currentLocation, isFollowing]);


  // ✅ 핵심: 백그라운드 위치 추적 시작
  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    
    // 기존 watchPositionAsync 대신 startLocationUpdatesAsync 사용
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
        // 안드로이드 알림바 설정 (필수)
        foregroundService: {
            notificationTitle: "RunBoo Running",
            notificationBody: "러닝 기록을 측정 중입니다.",
            notificationColor: "#4A6EA9"
        },
        // iOS 설정
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Fitness,
    });
  };

  const stopRun = async () => {
    // 1. 백그라운드 작업 중단
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    stopStoreRun();
    if (timerRef.current) clearInterval(timerRef.current);

    const avgPaceSec = distance > 0 ? displayTime / (distance / 1000) : 0;

    const requestData = {
      userId: userId ? Number(userId) : 0,
      mode: "NORMAL" as const,
      distanceM: Math.floor(distance),
      durationSec: displayTime,
      avgPace: Math.floor(avgPaceSec),
      calories: Math.floor(distance * 0.05),
      routePolyline: encodePath(routeCoordinates),
      startedAt: startTime ? toIsoPlus9(new Date(startTime)) : new Date().toISOString(),
      endedAt: toIsoPlus9(new Date()),
    };

    try {
      await createRecord(requestData);
    } catch (e) {
      console.error(e);
    }

    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: displayTime,
      avgPaceSec,
      calories: Math.floor(distance * 0.05),
      routeCoordinates,
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
      paceHistory: [], // 필요하면 스토어에 추가 구현 필요
      targetDistance,
      isFollowing,
      initialLocation,
    },
    actions: {
      pauseRun: pauseStoreRun,
      resumeRun: resumeStoreRun,
      stopRun,
      toggleFollowing: () => setIsFollowing(!isFollowing),
      setIsFollowing,
      onLocationUpdate,
    },
    utils,
  };
};
