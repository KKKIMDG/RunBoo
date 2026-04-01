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
        null,
    );

    const { pushCadenceSample, resetCadenceAgg, avgCadence } = useCadence();
    const { displayTime, paceHistory } = useRunTimer(
        isRunning,
        isPaused,
        startTime,
        pausedTime,
        currentPace,
    );

    const watchRef = useRef<Location.LocationSubscription | null>(null);
    const completeLockRef = useRef(false);

    const utils = {
        formatTime,
        formatPace,
    };

    const startLocationTracking = makeStartLocationTracking(
        "RunBoo Tier Challenge",
        "티어 측정 중입니다. 힘내세요!",
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
                "GPS가 꺼져 있어 티어 측정을 시작할 수 없습니다.",
            );
            return false;
        }

        const fg = await Location.getForegroundPermissionsAsync();
        if (fg.status !== "granted") {
            const req = await Location.requestForegroundPermissionsAsync();
            if (req.status !== "granted") {
                Alert.alert(
                    "위치 권한 필요",
                    "티어 측정을 위해 위치 권한이 필요합니다.",
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

                console.log("[useTierRunningScreen] foreground location:", {
                    latitude,
                    longitude,
                    accuracy,
                });

                if (accuracy != null && accuracy > 100) {
                    console.log("[useTierRunningScreen] accuracy too low -> ignored");
                    return;
                }

                updateLocation(location);
            },
        );

        console.log("[useTierRunningScreen] foreground tracking started");
        return true;
    };

    const stopForegroundTracking = async () => {
        if (watchRef.current) {
            watchRef.current.remove();
            watchRef.current = null;
            console.log("[useTierRunningScreen] foreground tracking stopped");
        }
    };

    useEffect(() => {
        (async () => {
            resetStore();
            resetCadenceAgg();
            completeLockRef.current = false;

            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== "granted") {
                Alert.alert(
                    "위치 권한 필요",
                    "티어 측정을 위해 위치 권한이 필요합니다.",
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
        const remain = targetDistance - distance;
        setRemainingDistance(remain > 0 ? remain : 0);

        if (isRunning && !completeLockRef.current && distance >= targetDistance) {
            completeLockRef.current = true;
            handleComplete(false);
        }
    }, [distance, isRunning, targetDistance]);

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
                            "[useTierRunningScreen] background tracking start failed",
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

    const handleComplete = async (isStopped: boolean = false) => {
        await stopForegroundTracking();
        await stopBackgroundLocation();
        stopStoreRun();

        if (distance < 100) {
            Alert.alert(
                "기록 저장 불가",
                "100m 미만의 활동은 측정 기록으로 인정되지 않습니다.",
                [{ text: "확인", onPress: () => navigation.goBack() }],
            );
            return;
        }

        const finalDist = Math.min(distance, targetDistance);
        const avgPaceSec = finalDist > 0 ? displayTime / (finalDist / 1000) : 0;
        const currentAvgCadence = avgCadence();

        try {
            const { recordId: finalRecordId } = await saveRecord({
                userId: userId ? Number(userId) : 0,
                mode: "TIER",
                distanceM: Math.floor(finalDist),
                durationSec: displayTime,
                avgPaceSec,
                calories: Math.floor(finalDist * 0.05),
                cadence: currentAvgCadence,
                routeCoordinates,
                startedAtIso: startTime ? toIsoPlus9(new Date(startTime)) : undefined,
                endedAtIso: toIsoPlus9(new Date()),
            });

            if (isStopped) {
                navigation.navigate("RunResult", {
                    distanceM: finalDist,
                    durationSec: displayTime,
                    avgPaceSec,
                    calories: Math.floor(finalDist * 0.05),
                    routeCoordinates,
                    recordId: finalRecordId ?? 0,
                    cadenceSpm: currentAvgCadence,
                });
            } else {
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
                    cadenceSpm: currentAvgCadence,
                });
            }
        } catch (e) {
            console.error("Tier Complete Error:", e);
            Alert.alert("저장 오류", "기록 저장 중 문제가 발생했습니다.");
        }
    };

    const handleStopPress = () => {
        pauseRun();

        Alert.alert(
            "측정 중단",
            "목표 거리를 채우지 못했습니다. 중단하고 현재까지의 기록만 저장할까요?",
            [
                {
                    text: "계속하기",
                    onPress: () => resumeRun(),
                    style: "cancel",
                },
                {
                    text: "그만두기",
                    onPress: () => {
                        completeLockRef.current = true;
                        handleComplete(true);
                    },
                    style: "destructive",
                },
            ],
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
            pauseRun,
            resumeRun,
            stopTierRunManual: handleStopPress,
            pushCadenceSample,
        },
        utils,
    };
};