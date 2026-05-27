import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import type { RootStackParamList } from "@/navigation/root/RootNavigator";
import { useRecordStore } from "@/stores/recordStore";
import { fetchUserVoiceSetting } from "@/services/user/userService";
import { UserVoiceSetting } from "@/types/userSetting";
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
import { perfLogger, trackArray } from "@/utils/performanceLogger";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Coordinate = { latitude: number; longitude: number };

export const useRunningScreen = () => {
    useKeepAwake();

    const navigation = useNavigation<RunningScreenNavigationProp>();
    const route = useRoute<RunningScreenRouteProp>();
    const { userMe } = useUserMe();

    const userId = userMe?.userId;
    const targetDistance = route.params?.targetDistance ?? 0;

    const voiceGuideEnabled = route.params?.voiceGuideEnabled;
    const voiceType = route.params?.voiceType;
    const [isMale, setIsMale] = useState(voiceType === "MALE");
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(
        voiceGuideEnabled ?? true,
    );

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
    const { displayTime, paceHistory } = useRunTimer(
        isRunning,
        isPaused,
        startTime,
        pausedTime,
        currentPace,
    );

    const watchRef = useRef<Location.LocationSubscription | null>(null);

    const utils = {
        formatTime,
        formatPace,
    };

    const startLocationTracking = makeStartLocationTracking(
        "RunBoo Running",
        "러닝 기록을 측정 중입니다.",
    );

    // foreground 실시간 위치 추적
    const startForegroundTracking = async () => {
        if (watchRef.current) {
            watchRef.current.remove();
            watchRef.current = null;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
            Alert.alert("위치 서비스 필요", "GPS가 꺼져 있어 러닝을 기록할 수 없습니다.");
            return false;
        }

        const fg = await Location.getForegroundPermissionsAsync();
        if (fg.status !== "granted") {
            const req = await Location.requestForegroundPermissionsAsync();
            if (req.status !== "granted") {
                Alert.alert("위치 권한 필요", "러닝 기록을 위해 위치 권한이 필요합니다.");
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

                console.log("[useRunningScreen] foreground location:", {
                    latitude,
                    longitude,
                    accuracy,
                });

                // 너무 부정확한 좌표만 제외
                if (accuracy != null && accuracy > 100) {
                    console.log("[useRunningScreen] accuracy too low -> ignored");
                    return;
                }

                // 핵심: 실시간 위치를 store에 반영
                updateLocation(location);
            },
        );

        console.log("[useRunningScreen] foreground tracking started");
        return true;
    };

    const stopForegroundTracking = async () => {
        if (watchRef.current) {
            watchRef.current.remove();
            watchRef.current = null;
            console.log("[useRunningScreen] foreground tracking stopped");
        }
    };

    // 1. 초기 진입
    useEffect(() => {
        (async () => {
            resetStore();
            resetCadenceAgg();

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "위치 권한 필요",
                    "러닝 기록을 위해 위치 권한이 필요합니다.",
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

            // 시작 전 현재 위치 store 반영
            updateLocation(loc);
        })();

        return () => {
            stopForegroundTracking();
            stopBackgroundLocation();
        };
    }, []);

    // 2. 서버에서 유저 음성 설정 가져오기
    useEffect(() => {
        (async () => {
            try {
                const userVoice: UserVoiceSetting = await fetchUserVoiceSetting();
                if (voiceGuideEnabled === undefined) {
                    setIsVoiceEnabled(userVoice.voiceGuideEnabled);
                    setIsMale(userVoice.voiceType === "MALE");
                }
            } catch (e) {
                console.log("[useRunningScreen] voice setting fetch skipped");
            }
        })();
    }, []);

    // 3. 카운트다운 -> 시작
    useEffect(() => {
        if (isReady && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (isReady && countdown === 0) {
            (async () => {
                resetCadenceAgg();
                startStoreRun();

                // 실시간 거리/경로/페이스 계산용
                const started = await startForegroundTracking();

                // background 보조 추적
                if (started) {
                    try {
                        await startLocationTracking();
                    } catch (e) {
                        console.warn("[useRunningScreen] background tracking start failed", e);
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
        perfLogger.start("stopRun - 전체 처리");

        await stopForegroundTracking();
        await stopBackgroundLocation();

        stopStoreRun();

        const avgPaceSec = distance > 0 ? displayTime / (distance / 1000) : 0;
        const calories = Math.floor(distance * 0.05);

        trackArray("routeCoordinates", routeCoordinates.length, 5000);
        trackArray("paceHistory", paceHistory.length, 5000);

        let recordId: number | undefined = undefined;

        try {
            perfLogger.start("saveRecord - API 호출");

            const { recordId: rid } = await saveRecord({
                userId: userId ? Number(userId) : 0,
                mode: "NORMAL",
                distanceM: Math.floor(distance),
                durationSec: displayTime,
                avgPaceSec,
                calories,
                cadence: avgCadence(),
                routeCoordinates,
                startedAtIso: startTime ? toIsoPlus9(new Date(startTime)) : undefined,
                endedAtIso: toIsoPlus9(new Date()),
            });

            perfLogger.end("saveRecord - API 호출");
            recordId = rid;
        } catch (e) {
            perfLogger.end("saveRecord - API 호출", { error: true });
            console.error("[useRunningScreen] 기록 저장 실패:", e);
        }

        perfLogger.end("stopRun - 전체 처리");

        navigation.navigate("RunResult", {
            distanceM: distance,
            durationSec: displayTime,
            avgPaceSec,
            calories,
            routeCoordinates,
            cadenceSpm: avgCadence(),
            recordId,
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
            paceHistory,
            targetDistance,
            initialLocation,
            isVoiceEnabled,
            isMale,
        },
        actions: {
            pauseRun,
            resumeRun,
            stopRun,
            pushCadenceSample,
            setIsVoiceEnabled,
            setIsMale,
        },
        utils,
    };
};