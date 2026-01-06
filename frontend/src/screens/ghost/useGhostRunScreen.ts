// frontend/src/screens/ghost/useGhostRunScreen.ts

import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { encodePath } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";
import { createRecord } from "@/services/record/recordsService";
import { useRecordStore } from "@/stores/recordStore";
import { LOCATION_TASK_NAME } from "@/services/record/locationTask";

// ✅ 저장할 때만 +9시간 보정해서 ISO(UTC)로 보내기
const toIsoPlus9 = (d: Date) =>
    new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

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
        distance, // 스토어의 distance를 distanceM으로 매핑
        currentPace, // 스토어의 currentPace (sec/km)
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
        updateLocation
    } = useRecordStore();

    // UI 갱신용 시간
    const [displayTime, setDisplayTime] = useState(0);
    // 차트용 히스토리 (로컬)
    const [paceHistoryMin, setPaceHistoryMin] = useState<number[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
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

    // 1. 초기화 및 권한 요청
    useEffect(() => {
        (async () => {
            resetStore();
            
            const { status: foreStatus } = await Location.requestForegroundPermissionsAsync();
            if (foreStatus !== "granted") {
                Alert.alert("권한 필요", "위치 권한이 필요합니다.", [
                    { text: "설정", onPress: () => Linking.openSettings() }
                ]);
                return;
            }
            
            await Location.requestBackgroundPermissionsAsync();

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            updateLocation(loc); // 초기 위치 주입
        })();
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // 2. 카운트다운
    useEffect(() => {
        if (isReady && countdown > 0) {
            const t = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(t);
        } else if (isReady && countdown === 0) {
            startStoreRun();
            startLocationTracking();
        }
    }, [isReady, countdown]);

    // 3. 타이머 및 그래프
    useEffect(() => {
        if (isRunning && !isPaused && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
                const currentSec = durationSec >= 0 ? durationSec : 0;
                
                setDisplayTime(currentSec);

                if (currentSec % 5 === 0 && currentPace > 0) {
                    setPaceHistoryMin((arr) => [...arr, currentPace / 60]);
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isPaused, startTime, pausedTime, currentPace]);

    // ✅ 백그라운드 위치 추적
    const startLocationTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
            foregroundService: {
                notificationTitle: "RunBoo Ghost Challenge",
                notificationBody: "고스트와 대결 중입니다.",
                notificationColor: "#4A6EA9"
            },
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.Fitness,
        });
    };

    // ✅ 저장
    const stopRun = async () => {
        // 백그라운드 중단
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }

        stopStoreRun();
        if (timerRef.current) clearInterval(timerRef.current);

        const avgPaceSec = distance > 0 ? displayTime / (distance / 1000) : 0;
        const calories = Math.floor(distance * 0.05);

        const finalUserId = userId ? Number(userId) : 0;
        if (!finalUserId) {
            Alert.alert(
                "오류",
                "userId가 없습니다. (GhostRun으로 이동할 때 userId를 params로 넘겨야 합니다.)"
            );
            navigation.navigate("RunResult", {
                distanceM: distance,
                durationSec: displayTime,
                avgPaceSec,
                calories,
                routeCoordinates,
            });
            return;
        }

        const requestData = {
            userId: finalUserId,
            mode: "GHOST" as const,
            distanceM: Math.floor(distance),
            durationSec: displayTime,
            avgPace: Math.floor(avgPaceSec),
            calories,
            routePolyline: encodePath(routeCoordinates),
            startedAt: startTime ? toIsoPlus9(new Date(startTime)) : new Date().toISOString(),
            endedAt: toIsoPlus9(new Date()),
        };

        console.log("=========================================");
        console.log("🚀 [DEBUG] 고스트 기록 저장 요청 전송 데이터:");
        console.log(JSON.stringify(requestData, null, 2));
        console.log("=========================================");

        try {
            const response = await createRecord(requestData);
            console.log("✅ [DEBUG] 고스트 저장 서버 응답:", response);
        } catch (error: any) {
            console.error("❌ [DEBUG] 고스트 저장 실패 에러:", error);
            Alert.alert("저장 실패", `기록을 저장하지 못했습니다. (${error?.message || "네트워크 에러"})`);
        }

        navigation.navigate("RunResult", {
            distanceM: distance,
            durationSec: displayTime,
            avgPaceSec,
            calories,
            routeCoordinates,
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
            distanceM: distance, // 스토어 값 연결
            currentPaceSec: currentPace, // 스토어 값 연결
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
            stopRun 
        },
        utils: { formatTime, formatPace, formatDiffBadge, formatPaceDiff },
    };
}
