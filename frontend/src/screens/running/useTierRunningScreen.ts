import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { Coordinate, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { evaluateTier } from "@/services/tier/tierService";
import { createRecord, fetchMyRecords } from "@/services/record/recordsService";
import { useRecordStore } from "@/stores/recordStore";
import { LOCATION_TASK_NAME } from "@/services/record/locationTask";
import { useKeepAwake } from "expo-keep-awake";

type TierRunningRouteProp = RouteProp<RootStackParamList, "TierRunning">;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const toIsoPlus9 = (d: Date) =>
    new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

export const useTierRunningScreen = () => {
    useKeepAwake();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<TierRunningRouteProp>();

    const userId = route?.params?.userId;
    const targetDistance = route.params?.targetDistance ?? 5000;
    const distanceTypeKey: "5k" | "10k" = targetDistance <= 5000 ? "5k" : "10k";

    // Store 구독 (일반 러닝과 공유)
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
    const [paceHistory, setPaceHistory] = useState<number[]>([]);
    const [initialLocation, setInitialLocation] = useState<Coordinate | null>(
        null
    );

    // UI 갱신용 시간 (초 단위)
    const [displayTime, setDisplayTime] = useState(0);

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

    // 1. 초기화
    useEffect(() => {
        (async () => {
            resetStore(); // 스토어 초기화

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });

            setInitialLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            updateLocation(loc); // 지도 즉시 표시를 위해 스토어 주입
        })();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ✅ 백그라운드 트래킹 시작
    const startLocationTracking = async () => {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
            foregroundService: {
                notificationTitle: "RunBoo Tier Challenge",
                notificationBody: "티어 측정 중입니다. 힘내세요!",
                notificationColor: "#4A6EA9",
            },
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.Fitness,
        });
    };

    // 2. 남은 거리 계산 및 자동 종료 체크
    // ✅ 목표 달성 시 자동 종료: 이 훅 내부에서는 cadence를 알 수 없으니 기본값(0)로 종료
    //    (최종 cadence가 꼭 필요하면 TierRunningScreen에서 callback/ref로 넘겨주는 구조로 바꿔야 함)
    useEffect(() => {
        const remain = targetDistance - distance;
        setRemainingDistance(remain > 0 ? remain : 0);

        if (isRunning && distance >= targetDistance) {
            handleComplete(false, 0); // 정상 종료(자동) - cadence 기본 0
        }
    }, [distance, isRunning, targetDistance]);

    // 3. 카운트다운 및 시작
    useEffect(() => {
        if (isReady && countdown > 0) {
            const t = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(t);
        } else if (isReady && countdown === 0) {
            startStoreRun();
            startLocationTracking();
        }
    }, [isReady, countdown]);

    // 4. 타이머 및 페이스 히스토리 (UI 갱신용)
    useEffect(() => {
        if (isRunning && !isPaused && startTime) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
                const currentSec = durationSec >= 0 ? durationSec : 0;

                setDisplayTime(currentSec);

                // 5초마다 페이스 히스토리 기록 (차트용 - 로컬 상태 유지)
                if (currentSec % 5 === 0 && currentPace > 0) {
                    setPaceHistory((prev) => [...prev, currentPace / 60]);
                }
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isPaused, startTime, pausedTime, currentPace]);

    // ✅ 완료 처리 (정상 종료 / 중단 종료)
    // ✅ 변경: finalCadenceSpm를 받아서 결과 화면 params에 전달
    const handleComplete = async (
        isStopped: boolean = false,
        finalCadenceSpm: number = 0
    ) => {
        // 1) 백그라운드 위치 업데이트 중단
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TASK_NAME
        );
        if (hasStarted) await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

        // 2) 스토어 종료 + 타이머 종료
        stopStoreRun();
        if (timerRef.current) clearInterval(timerRef.current);

        // ✅ 100m 미만 기록 방지
        if (distance < 100) {
            Alert.alert(
                "기록 저장 불가",
                "100m 미만의 활동은 측정 기록으로 인정되지 않습니다.",
                [{ text: "확인", onPress: () => navigation.goBack() }]
            );
            return;
        }

        const finalDist = Math.min(distance, targetDistance);
        const avgPace = finalDist > 0 ? displayTime / (finalDist / 1000) : 0;

        try {
            const data = {
                userId: userId ? Number(userId) : 0,
                mode: "TIER" as const,
                distanceM: Math.floor(finalDist),
                durationSec: displayTime,
                avgPace: Math.floor(avgPace),
                calories: Math.floor(finalDist * 0.05),
                routePolyline: encodePath(routeCoordinates),
                startedAt: startTime
                    ? toIsoPlus9(new Date(startTime))
                    : new Date().toISOString(),
                endedAt: toIsoPlus9(new Date()),
            };

            await createRecord(data);

            // 방금 생성한 레코드 ID 조회 (기존 로직 유지)
            const records = await fetchMyRecords();
            const finalRecordId = Math.max(...records.map((r: any) => r.id));

            const cadenceSpm = Math.round(finalCadenceSpm ?? 0);

            if (isStopped) {
                // ✅ 중도 포기 -> 일반 결과 화면 (RunResult)
                navigation.navigate("RunResult", {
                    distanceM: finalDist,
                    durationSec: displayTime,
                    avgPaceSec: avgPace,
                    calories: Math.floor(finalDist * 0.05),
                    routeCoordinates,
                    // ✅ 추가
                    cadenceSpm,
                });
            } else {
                // ✅ 목표 달성 -> 티어 평가 및 결과 화면 (TierResult)
                const tierData = await evaluateTier({
                    recordId: finalRecordId,
                    distanceType: distanceTypeKey,
                });

                navigation.navigate("TierResult", {
                    userId,
                    recordId: finalRecordId,
                    distanceType: distanceTypeKey,
                    stats: {
                        distance: (finalDist / 1000).toFixed(2),
                        time: utils.formatTime(displayTime),
                        pace: utils.formatPace(avgPace),
                    },
                    achievedTier: tierData.displayName,
                    distanceM: finalDist,
                    durationSec: displayTime,
                    avgPaceSec: avgPace,
                    calories: Math.floor(finalDist * 0.05),
                    routeCoordinates,
                    cadenceSpm,
                });
            }
        } catch (e) {
            console.error("Tier Complete Error:", e);
            Alert.alert("저장 오류", "기록 저장 중 문제가 발생했습니다.");
        }
    };

    // ✅ 중단 버튼 처리
    // ✅ 변경: 최종 케이던스를 인자로 받아 handleComplete(true, cadence)로 전달
    const handleStopPress = (finalCadenceSpm: number) => {
        pauseStoreRun(); // 스토어 일시정지
        Alert.alert(
            "측정 중단",
            "목표 거리를 채우지 못했습니다. 중단하고 현재까지의 기록만 저장할까요?",
            [
                {
                    text: "계속하기",
                    onPress: () => resumeStoreRun(),
                    style: "cancel",
                },
                {
                    text: "그만두기",
                    onPress: () => handleComplete(true, finalCadenceSpm),
                    style: "destructive",
                },
            ]
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
            pauseRun: pauseStoreRun,
            resumeRun: resumeStoreRun,

            // ✅ 변경: TierRunningScreen에서 stopTierRunManual(cadence) 형태로 호출
            stopTierRunManual: handleStopPress,
        },
        utils,
    };
};
