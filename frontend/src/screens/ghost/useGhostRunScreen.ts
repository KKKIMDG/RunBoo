import { useEffect, useRef, useState } from "react";
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

type Coordinate = {
    latitude: number;
    longitude: number;
};

export function useGhostRunScreen() {
    useKeepAwake();

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const userId = route?.params?.userId;
    const ghost: GhostProfileDto | undefined = route?.params?.ghost;

    const ghostTotalDistanceM = (ghost?.targetDistanceKm ?? 5.2) * 1000;
    const ghostAvgPaceSec = ghost?.avgPace ?? 280;

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
        null,
    );

    const { pushCadenceSample, resetCadenceAgg, avgCadence } = useCadence();
    const { displayTime, paceHistory: paceHistoryMin } = useRunTimer(
        isRunning,
        isPaused,
        startTime,
        pausedTime,
        currentPace,
    );

    const watchRef = useRef<Location.LocationSubscription | null>(null);

    const ghostDistanceM = isRunning
        ? Math.min(ghostTotalDistanceM, (displayTime / ghostAvgPaceSec) * 1000)
        : 0;

    const diffM = ghostDistanceM - distance;

    const progress =
        ghostTotalDistanceM > 0
            ? Math.max(0, Math.min(1, distance / ghostTotalDistanceM))
            : 0;

    const paceDiffSec = (currentPace || 0) - ghostAvgPaceSec;

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

    const startLocationTracking = makeStartLocationTracking(
        "RunBoo Ghost Challenge",
        "고스트와 대결 중입니다.",
    );

    const startForegroundTracking = async () => {
        if (watchRef.current) {
            watchRef.current.remove();
            watchRef.current = null;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
            Alert.alert(
                "위치 서비스 필요",
                "GPS가 꺼져 있어 고스트 러닝을 시작할 수 없습니다.",
            );
            return false;
        }

        const fg = await Location.getForegroundPermissionsAsync();
        if (fg.status !== "granted") {
            const req = await Location.requestForegroundPermissionsAsync();
            if (req.status !== "granted") {
                Alert.alert(
                    "위치 권한 필요",
                    "고스트 러닝을 위해 위치 권한이 필요합니다.",
                );
                return false;
            }
        }

        watchRef.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 1000,
                distanceInterval: 3,
                mayShowUserSettingsDialog: true,
            },
            (location) => {
                const { latitude, longitude, accuracy } = location.coords;

                console.log("[useGhostRunScreen] foreground location:", {
                    latitude,
                    longitude,
                    accuracy,
                });

                if (accuracy != null && accuracy > 100) {
                    console.log("[useGhostRunScreen] accuracy too low -> ignored");
                    return;
                }

                updateLocation(location);
            },
        );

        console.log("[useGhostRunScreen] foreground tracking started");
        return true;
    };

    const stopForegroundTracking = async () => {
        if (watchRef.current) {
            watchRef.current.remove();
            watchRef.current = null;
            console.log("[useGhostRunScreen] foreground tracking stopped");
        }
    };

    useEffect(() => {
        (async () => {
            resetStore();
            resetCadenceAgg();

            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== "granted") {
                Alert.alert(
                    "위치 권한 필요",
                    "고스트 러닝을 위해 위치 권한이 필요합니다.",
                );
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            setInitialLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });

            updateLocation(loc);
        })();

        return () => {
            stopForegroundTracking();
            stopBackgroundLocation();
        };
    }, []);

    useEffect(() => {
        if (isReady && countdown > 0) {
            const t = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(t);
        }

        if (isReady && countdown === 0) {
            (async () => {
                resetCadenceAgg();
                startStoreRun();

                const started = await startForegroundTracking();

                if (started) {
                    try {
                        await startLocationTracking();
                    } catch (e) {
                        console.warn(
                            "[useGhostRunScreen] background tracking start failed",
                            e,
                        );
                    }
                }
            })();
        }
    }, [isReady, countdown]);

    const pauseRun = async () => {
        pauseStoreRun();
        await stopForegroundTracking();
    };

    const resumeRun = async () => {
        resumeStoreRun();
        await startForegroundTracking();
    };

    const stopRun = async () => {
        const finalDistance = distance;
        const finalRouteCoordinates = routeCoordinates;
        const finalStartTime = startTime;
        const finalDisplayTime = displayTime;

        await stopForegroundTracking();
        await stopBackgroundLocation();

        if (finalDistance < 100) {
            stopStoreRun();

            Alert.alert(
                "기록 저장 불가",
                "100m 미만의 활동은 고스트 대결 기록으로 저장되지 않습니다.",
                [
                    {
                        text: "확인",
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: "MainStack" }],
                            });
                        },
                    },
                ],
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
                "userId가 없습니다. (GhostRun으로 이동할 때 userId를 params로 넘겨야 합니다.)",
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
                `기록을 저장하지 못했습니다. (${error?.message || "네트워크 에러"})`,
            );
        }

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
            initialLocation,
            paceHistoryMin,
            ghostDistanceM,
            diffM,
            progress,
            paceDiffSec,
            ghostTotalDistanceM,
            ghostAvgPaceSec,
        },
        actions: {
            pauseRun,
            resumeRun,
            stopRun,
            pushCadenceSample,
        },
        utils: { formatTime, formatPace, formatDiffBadge, formatPaceDiff },
    };
}