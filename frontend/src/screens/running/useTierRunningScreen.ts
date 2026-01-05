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

// ✅ 저장할 때만 +9시간 보정해서 ISO(UTC)로 보내기
const toIsoPlus9 = (d: Date) =>
    new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

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

    const [lastLocation, setLastLocation] = useState<Coordinate | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const locationSub = useRef<Location.LocationSubscription | null>(null);

    const utils = {
        formatTime: (s: number) => {
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = s % 60;
            return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${sec < 10 ? "0" + sec : sec}`;
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
                        if (next % 5 === 0) setPaceHistory((prevH) => [...prevH, pace / 60]);
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

        // 목표 거리를 초과하지 않도록 보정 (사용자 경험 유지)
        const finalDistance = Math.min(distance, targetDistance);
        const avgPaceSec = finalDistance > 0 ? time / (finalDistance / 1000) : 0;
        const calories = Math.floor(finalDistance * 0.05);

        try {
            const requestData = {
                userId: userId ? Number(userId) : 0,
                mode: "TIER" as const,
                distanceM: Math.floor(finalDistance),
                durationSec: time,
                avgPace: Math.floor(avgPaceSec),
                calories,
                routePolyline: encodePath(routeCoordinates),

                // ✅ [변경] 저장할 때만 +9 보정
                startedAt: toIsoPlus9(new Date(Date.now() - time * 1000)),
                endedAt: toIsoPlus9(new Date()),
            };

            await createRecord(requestData);

            const records = await fetchMyRecords();
            if (!records || records.length === 0) throw new Error("기록을 찾을 수 없습니다.");

            const finalRecordId = Math.max(...records.map((r: any) => r.id));

            if (isStopped) {
                Alert.alert("알림", "측정을 중단합니다. 기록 페이지로 이동합니다.", [
                    {
                        text: "확인",
                        onPress: () => {
                            navigation.navigate("RunResult", {
                                distanceM: finalDistance,
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
                                distance: (finalDistance / 1000).toFixed(2),
                                time: utils.formatTime(time),
                                pace: utils.formatPace(avgPaceSec),
                            },
                            achievedTier: tierData.displayName,
                            distanceM: finalDistance,
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

        const initialPos = await Location.getCurrentPositionAsync({});
        setLastLocation({
            latitude: initialPos.coords.latitude,
            longitude: initialPos.coords.longitude,
        });

        locationSub.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                distanceInterval: 3, // 실제 러닝 측정을 위해 3m 간격으로 복구
            },
            (loc) => {
                const { latitude, longitude } = loc.coords;
                const newCoord = { latitude, longitude };

                setRouteCoordinates((prev) => {
                    if (prev.length > 0) {
                        const d = getDistance(
                            prev[prev.length - 1].latitude,
                            prev[prev.length - 1].longitude,
                            latitude,
                            longitude
                        );

                        // 실제 이동 거리(d)를 그대로 반영
                        if (d > 0.5 && d < 30) {
                            setDistance((cur) => cur + d);
                        }
                    }
                    return [...prev, newCoord];
                });

                setLastLocation(newCoord);
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
            lastLocation,
        },
        actions: {
            pauseRun: () => setIsPaused(true),
            resumeRun: () => setIsPaused(false),
            stopTierRunManual: handleStopPress,
        },
        utils,
    };
};
