import {useEffect, useRef, useState} from "react";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import {encodePath} from "@/utils/runUtils";
import {createRecord, fetchMyRecords} from "@/services/record/recordsService";
import {LOCATION_TASK_NAME} from "@/services/record/locationTask";

export const toIsoPlus9 = (d: Date) =>
    new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString();

export function normalizeCadence(spm: number): number | null {
    const v = Number(spm);
    if (!Number.isFinite(v)) return null;
    const r = Math.round(v);
    if (r < 40 || r > 260) return null;
    return r;
}

export function useCadence() {
    const cadenceSumRef = useRef(0);
    const cadenceCountRef = useRef(0);

    const pushCadenceSample = (spm: number) => {
        const v = normalizeCadence(spm);
        if (v == null) {
            console.log("[케이던스] 유효하지 않은 샘플:", spm);
            return;
        }
        cadenceSumRef.current += v;
        cadenceCountRef.current += 1;
        console.log(
            `[케이던스] 샘플 추가됨: ${v} SPM (총 ${cadenceCountRef.current}개)`
        );
    };

    const resetCadenceAgg = () => {
        console.log("[케이던스] 집계 초기화");
        cadenceSumRef.current = 0;
        cadenceCountRef.current = 0;
    };

    const avgCadence = () => {
        const n = cadenceCountRef.current;
        if (n <= 0) {
            console.log("[케이던스] 샘플 없음 → 평균 0 반환");
            return 0;
        }
        const avg = Math.round(cadenceSumRef.current / n);
        console.log(`[케이던스] 평균 케이던스: ${avg} SPM (${n}개 기준)`);
        return avg;
    };

    return {pushCadenceSample, resetCadenceAgg, avgCadence};
}

export function useRunTimer(
    isRunning: boolean,
    isPaused: boolean,
    startTime: number | null,
    pausedTime: number,
    currentPace: number
) {
    const [displayTime, setDisplayTime] = useState(0);
    const [paceHistory, setPaceHistory] = useState<number[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRunning && !isPaused && startTime) {
            console.log("[타이머] 러닝 타이머 시작");
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
                const currentSec = durationSec >= 0 ? durationSec : 0;
                setDisplayTime(currentSec);

                if (currentSec > 0 && currentSec % 5 === 0 && currentPace > 0) {
                    console.log(
                        `[타이머] 페이스 기록 추가: ${
                            currentPace / 60
                        } 분/km (${currentSec}초)`
                    );
                    setPaceHistory((prev) => [...prev, currentPace / 60]);
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                console.log("[타이머] 타이머 정지");
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning, isPaused, startTime, pausedTime, currentPace]);

    return {displayTime, paceHistory};
}

export function makeStartLocationTracking(
    notificationTitle: string,
    notificationBody: string
) {
    return async function startLocationTracking() {
        console.log("[위치추적] 백그라운드 위치 추적 시작");
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 3000,
            distanceInterval: 5,
            foregroundService: {
                notificationTitle,
                notificationBody,
                notificationColor: "#4A6EA9",
            },
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.Fitness,
        });
        console.log("[위치추적] 위치 업데이트 시작됨");
    };
}

export async function stopBackgroundLocation() {
    try {
        console.log("[위치추적] 위치 추적 상태 확인 중");
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TASK_NAME
        );
        if (hasStarted) {
            console.log("[위치추적] 위치 업데이트 중지");
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log("[위치추적] 위치 업데이트 중지 완료");
        } else {
            console.log("[위치추적] 현재 실행 중인 위치 추적 없음");
        }
    } catch (e) {
        console.warn("[위치추적] 위치 추적 중지 실패", e);
    }
}

export async function saveRecord(params: {
    userId: number;
    mode: "NORMAL" | "TIER" | "GHOST";
    distanceM: number;
    durationSec: number;
    avgPaceSec: number;
    calories: number;
    cadence: number;
    routeCoordinates: any[];
    startedAtIso?: string;
    endedAtIso?: string;
}) {
    console.log("[기록저장] 러닝 기록 준비 중:", {
        모드: params.mode,
        거리: params.distanceM,
        시간: params.durationSec,
        평균페이스: params.avgPaceSec,
        케이던스: params.cadence,
        경로포인트수: params.routeCoordinates.length,
    });

    const requestData = {
        userId: params.userId,
        mode: params.mode,
        distanceM: Math.floor(params.distanceM),
        durationSec: params.durationSec,
        avgPace: Math.floor(params.avgPaceSec),
        calories: Math.floor(params.calories),
        cadence: params.cadence,
        routePolyline: encodePath(params.routeCoordinates),
        startedAt: params.startedAtIso ?? new Date().toISOString(),
        endedAt: params.endedAtIso ?? new Date().toISOString(),
    };

    try {
        console.log("[기록저장] 서버로 기록 전송");
        const response = await createRecord(requestData as any);
        let recordId: number | undefined = response?.id;

        console.log("[기록저장] 서버 응답:", {recordId, response});

        if (!recordId) {
            console.log("[기록저장] recordId 없음 → 기록 목록 재조회");
            const records = await fetchMyRecords();
            if (records?.length) {
                recordId = Math.max(...records.map((r: any) => Number(r.id)));
                console.log("[기록저장] 재조회로 recordId 결정:", recordId);
            }
        }

        console.log("[기록저장] 기록 저장 완료:", recordId);
        return {recordId, response};
    } catch (e) {
        console.error("[기록저장] 기록 저장 실패", e);
        throw e;
    }
}

export const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${
        sec < 10 ? "0" + sec : sec
    }`;
};

export const formatPace = (p: number) => {
    if (p === 0 || !isFinite(p) || p > 3600) return "-'--\"";
    const m = Math.floor(p / 60);
    const s = Math.floor(p % 60);
    return `${m}'${s < 10 ? "0" + s : s}"`;
};

export function useMapFocusing(params: {
    mapRef: React.RefObject<MapView | null>;
    initialLocation: { latitude: number; longitude: number } | null;
    routeCoordinates: { latitude: number; longitude: number }[];
}) {
    const {mapRef, initialLocation, routeCoordinates} = params;
    const [isFollowing, setIsFollowing] = useState(true);
    const onLocationUpdate = useRef<
        ((coords: { latitude: number; longitude: number }) => void) | null
    >(null);

    useEffect(() => {
        console.log(
            `[지도포커스] 위치 추적 핸들러 설정 (자동추적: ${isFollowing})`
        );
        onLocationUpdate.current = (coords) => {
            if (isFollowing && mapRef.current) {
                console.log("[지도포커스] 현재 위치로 지도 이동:", coords);
                mapRef.current.animateToRegion(
                    {...coords, latitudeDelta: 0.002, longitudeDelta: 0.002},
                    1000
                );
            }
        };
    }, [isFollowing]);

    useEffect(() => {
        if (initialLocation && mapRef.current) {
            console.log("[지도포커스] 초기 위치 설정:", initialLocation);
            mapRef.current.animateToRegion(
                {...initialLocation, latitudeDelta: 0.002, longitudeDelta: 0.002},
                500
            );
        }
    }, [initialLocation]);

    const handleFocusPress = async () => {
        if (!isFollowing) {
            console.log("[지도포커스] 자동 추적 활성화");
            setIsFollowing(true);
            try {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                mapRef.current?.animateToRegion(
                    {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                    },
                    500
                );
            } catch (e) {
                console.warn("[지도포커스] 현재 위치 조회 실패 → 마지막 경로 사용", e);
                if (routeCoordinates.length > 0) {
                    const last = routeCoordinates[routeCoordinates.length - 1];
                    mapRef.current?.animateToRegion(
                        {...last, latitudeDelta: 0.002, longitudeDelta: 0.002},
                        500
                    );
                }
            }
        } else {
            console.log("[지도포커스] 자동 추적 비활성화");
            setIsFollowing(false);
        }
    };

    return {
        isFollowing,
        setIsFollowing,
        onLocationUpdate,
        handleFocusPress,
    };
}
