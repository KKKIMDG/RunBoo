import { useState, useEffect, useRef } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useKeepAwake } from "expo-keep-awake";
import { Coordinate, getDistance, encodePath } from "@/utils/runUtils";
import { RootStackParamList } from "@/navigation/root/RootNavigator";
import { createRecord } from "@/services/record/recordsService";

type RunningScreenRouteProp = RouteProp<RootStackParamList, "Running">;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// ✅ 저장할 때만 +9시간 보정해서 ISO(UTC)로 보내기
const toIsoPlus9 = (d: Date) =>
    new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

export const useRunningScreen = () => {
    useKeepAwake();
    const navigation = useNavigation<RunningScreenNavigationProp>();
    const route = useRoute<RunningScreenRouteProp>();

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
    const [isFollowing, setIsFollowing] = useState(true);

    const [initialLocation, setInitialLocation] = useState<Coordinate | null>(null);

    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const onLocationUpdate = useRef<((coords: Coordinate) => void) | null>(null);

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
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setInitialLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        })();
    }, []);

    useEffect(() => {
        if (isReady && countdown > 0) {
            const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isReady && countdown === 0) {
            setIsReady(false);
            setIsRunning(true);
            startLocationTracking();
        }
    }, [isReady, countdown]);

    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setTime((prev) => {
                    const next = prev + 1;
                    if (distance > 0) {
                        const pace = next / (distance / 1000);
                        setCurrentPace(pace);
                        if (next % 5 === 0) setPaceHistory((h) => [...h, pace / 60]);
                    }
                    return next;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isPaused, distance]);

    const startLocationTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 2000,
                distanceInterval: 5, // ✅ 최소 이동 간격을 5m로 상향
            },
            (newLocation) => {
                const { latitude, longitude, accuracy } = newLocation.coords;

                // ✅ GPS 정확도가 20m 이상으로 떨어지면 무시 (더 엄격하게)
                if (accuracy && accuracy > 20) return;

                if (onLocationUpdate.current) {
                    onLocationUpdate.current({ latitude, longitude });
                }

                setRouteCoordinates((prev) => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        const dist = getDistance(last.latitude, last.longitude, latitude, longitude);

                        // ✅ 필터링 로직 강화:
                        // 1. 최소 3m 이상 이동했을 때만 합산 (GPS 튀는 현상 방지)
                        // 2. 2초 동안 16m(시속 약 28km) 이상 이동했다면 튄 좌표로 간주하여 제외
                        if (dist >= 3 && dist < 16) {
                            setDistance((d) => d + dist);
                            return [...prev, { latitude, longitude }];
                        }
                        return prev;
                    }
                    return [{ latitude, longitude }];
                });
            }
        );
    };

    const stopRun = async () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        locationSubscription.current?.remove();

        const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;

        const requestData = {
            userId: userId ? Number(userId) : 0,
            mode: "NORMAL" as const,
            distanceM: Math.floor(distance),
            durationSec: time,
            avgPace: Math.floor(avgPaceSec),
            calories: Math.floor(distance * 0.05),
            routePolyline: encodePath(routeCoordinates),

            // ✅ [변경] 저장할 때만 +9 보정
            startedAt: toIsoPlus9(new Date(Date.now() - time * 1000)),
            endedAt: toIsoPlus9(new Date()),
        };

        try {
            await createRecord(requestData);
        } catch (e) {
            console.error(e);
        }

        navigation.navigate("RunResult", {
            distanceM: distance,
            durationSec: time,
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
            time,
            distance,
            currentPace,
            routeCoordinates,
            paceHistory,
            targetDistance,
            isFollowing,
            initialLocation,
        },
        actions: {
            pauseRun: () => setIsPaused(true),
            resumeRun: () => setIsPaused(false),
            stopRun,
            toggleFollowing: () => setIsFollowing(!isFollowing),
            setIsFollowing,
            onLocationUpdate,
        },
        utils,
    };
};
