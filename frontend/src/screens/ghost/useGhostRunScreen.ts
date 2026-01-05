// frontend/src/screens/ghost/useGhostRunScreen.ts

import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { encodePath, getDistance, Coordinate } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";
import { createRecord } from "@/services/record/recordsService";

export function useGhostRunScreen() {
    useKeepAwake();

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // ✅ [변경] 일반 런과 동일하게 params에서 userId 받기
    const userId = route?.params?.userId;
    const ghost: GhostProfileDto | undefined = route?.params?.ghost;

    // 고스트 기준값 (fallback 포함)
    const ghostTotalDistanceM = (ghost?.targetDistanceKm ?? 5.2) * 1000;
    const ghostAvgPaceSec = ghost?.avgPace ?? 280; // sec/km

    // 상태
    const [isReady, setIsReady] = useState(true);
    const [countdown, setCountdown] = useState(3);

    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [time, setTime] = useState(0); // sec
    const [distanceM, setDistanceM] = useState(0); // meter
    const [currentPaceSec, setCurrentPaceSec] = useState(0); // sec/km

    const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
    const [paceHistoryMin, setPaceHistoryMin] = useState<number[]>([]); // min/km

    // refs
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const startedAtRef = useRef<string | null>(null);

    // 고스트 진행거리(시간 기반)
    const ghostDistanceM = isRunning
        ? Math.min(ghostTotalDistanceM, (time / ghostAvgPaceSec) * 1000)
        : 0;

    // (+)면 내가 뒤처짐, (-)면 내가 앞섬
    const diffM = ghostDistanceM - distanceM;

    // progress (0~1)
    const progress =
        ghostTotalDistanceM > 0 ? Math.max(0, Math.min(1, distanceM / ghostTotalDistanceM)) : 0;

    // 페이스 비교(+)면 내가 느림, (-)면 내가 빠름
    const paceDiffSec = (currentPaceSec || 0) - ghostAvgPaceSec;

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

    // 카운트다운
    useEffect(() => {
        if (isReady && countdown > 0) {
            countdownTimerRef.current = setTimeout(() => setCountdown((p: number) => p - 1), 1000);
        } else if (isReady && countdown === 0) {
            setIsReady(false);
            startRun();
        }
        return () => {
            if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
        };
    }, [isReady, countdown]);

    // 타이머/페이스/그래프
    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setTime((prev) => {
                    const newTime = prev + 1;

                    if (distanceM > 0) {
                        const pace = newTime / (distanceM / 1000);
                        setCurrentPaceSec(pace);

                        if (newTime % 5 === 0) {
                            setPaceHistoryMin((arr) => [...arr, pace / 60]);
                        }
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isPaused, distanceM]);

    // 위치 추적
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

                setRouteCoordinates((prev) => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        const dist = getDistance(last.latitude, last.longitude, latitude, longitude);

                        if (dist > 0 && dist < 30) {
                            setDistanceM((d) => d + dist);
                        }
                    }
                    return [...prev, newPoint];
                });
            }
        );
    };

    // 제어
    const startRun = () => {
        startedAtRef.current = new Date().toISOString();
        setIsRunning(true);
        setIsPaused(false);
        startLocationTracking();
    };

    const pauseRun = () => {
        setIsPaused(true);
        if (locationSubscription.current) locationSubscription.current.remove();
    };

    const resumeRun = () => {
        setIsPaused(false);
        startLocationTracking();
    };

    // ✅ 저장
    const stopRun = async () => {
        setIsRunning(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (locationSubscription.current) locationSubscription.current.remove();

        const avgPaceSec = distanceM > 0 ? time / (distanceM / 1000) : 0;
        const calories = Math.floor(distanceM * 0.05);

        // ✅ [변경] 일반 런과 동일: route.params.userId 사용
        const finalUserId = userId ? Number(userId) : 0;
        if (!finalUserId) {
            Alert.alert("오류", "userId가 없습니다. (GhostRun으로 이동할 때 userId를 params로 넘겨야 합니다.)");
            navigation.navigate("RunResult", {
                distanceM,
                durationSec: time,
                avgPaceSec,
                calories,
                routeCoordinates,
            });
            return;
        }

        const requestData = {
            userId: finalUserId,
            mode: "GHOST" as const,
            distanceM: Math.floor(distanceM),
            durationSec: time,
            avgPace: Math.floor(avgPaceSec),
            calories,
            routePolyline: encodePath(routeCoordinates),
            startedAt: startedAtRef.current ?? new Date(Date.now() - time * 1000).toISOString(),
            endedAt: new Date().toISOString(),
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
            distanceM,
            durationSec: time,
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
            time,
            distanceM,
            currentPaceSec,
            routeCoordinates,
            paceHistoryMin,
            ghostDistanceM,
            diffM,
            progress,
            paceDiffSec,
            ghostTotalDistanceM,
            ghostAvgPaceSec,
        },
        actions: { pauseRun, resumeRun, stopRun },
        utils: { formatTime, formatPace, formatDiffBadge, formatPaceDiff },
    };
}
