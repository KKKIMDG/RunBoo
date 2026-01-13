import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { encodePath } from "@/utils/runUtils";
import { createRecord, fetchMyRecords } from "@/services/record/recordsService";
import { LOCATION_TASK_NAME } from "@/services/record/locationTask";

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
      console.log("[useCadence] Invalid cadence sample:", spm);
      return;
    }
    cadenceSumRef.current += v;
    cadenceCountRef.current += 1;
    console.log(
      `[useCadence] Sample added: ${v} SPM, Total count: ${cadenceCountRef.current}`
    );
  };

  const resetCadenceAgg = () => {
    console.log("[useCadence] Resetting cadence aggregation");
    cadenceSumRef.current = 0;
    cadenceCountRef.current = 0;
  };

  const avgCadence = () => {
    const n = cadenceCountRef.current;
    if (n <= 0) {
      console.log("[useCadence] No cadence samples, returning 0");
      return 0;
    }
    const avg = Math.round(cadenceSumRef.current / n);
    console.log(`[useCadence] Average cadence: ${avg} SPM (${n} samples)`);
    return avg;
  };

  return { pushCadenceSample, resetCadenceAgg, avgCadence };
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
      console.log("[useRunTimer] Starting timer");
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const durationSec = Math.floor((now - startTime - pausedTime) / 1000);
        const currentSec = durationSec >= 0 ? durationSec : 0;
        setDisplayTime(currentSec);

        if (currentSec > 0 && currentSec % 5 === 0 && currentPace > 0) {
          console.log(
            `[useRunTimer] Adding pace to history: ${
              currentPace / 60
            } min/km at ${currentSec}s`
          );
          setPaceHistory((prev) => [...prev, currentPace / 60]);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        console.log("[useRunTimer] Clearing timer");
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, startTime, pausedTime, currentPace]);

  return { displayTime, paceHistory };
}

export function makeStartLocationTracking(
  notificationTitle: string,
  notificationBody: string
) {
  return async function startLocationTracking() {
    console.log("[LocationTracking] Starting location updates");
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
    console.log("[LocationTracking] Location updates started successfully");
  };
}

export async function stopBackgroundLocation() {
  try {
    console.log("[LocationTracking] Checking if location updates are active");
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    if (hasStarted) {
      console.log("[LocationTracking] Stopping location updates");
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("[LocationTracking] Location updates stopped successfully");
    } else {
      console.log("[LocationTracking] Location updates were not active");
    }
  } catch (e) {
    console.warn("[LocationTracking] stopBackgroundLocation failed", e);
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
  console.log("[saveRecord] Preparing record data:", {
    mode: params.mode,
    distanceM: params.distanceM,
    durationSec: params.durationSec,
    avgPaceSec: params.avgPaceSec,
    cadence: params.cadence,
    routePoints: params.routeCoordinates.length,
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
    console.log("[saveRecord] Sending record to server...");
    const response = await createRecord(requestData as any);
    let recordId: number | undefined = response?.id;
    console.log("[saveRecord] Server response:", { recordId, response });

    if (!recordId) {
      console.log("[saveRecord] No recordId in response, fetching records...");
      const records = await fetchMyRecords();
      if (records?.length) {
        recordId = Math.max(...records.map((r: any) => Number(r.id)));
        console.log(
          "[saveRecord] Determined recordId from fetched records:",
          recordId
        );
      }
    }

    console.log("[saveRecord] Record saved successfully:", recordId);
    return { recordId, response };
  } catch (e) {
    console.error("[saveRecord] Failed to save record:", e);
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
  const { mapRef, initialLocation, routeCoordinates } = params;
  const [isFollowing, setIsFollowing] = useState(true);
  const onLocationUpdate = useRef<
    ((coords: { latitude: number; longitude: number }) => void) | null
  >(null);

  // 실시간 위치 추적
  useEffect(() => {
    console.log(
      `[useMapFocusing] Setting up location update handler, isFollowing: ${isFollowing}`
    );
    onLocationUpdate.current = (coords) => {
      if (isFollowing && mapRef.current) {
        console.log(`[useMapFocusing] Animating to location:`, coords);
        mapRef.current.animateToRegion(
          { ...coords, latitudeDelta: 0.002, longitudeDelta: 0.002 },
          1000
        );
      }
    };
  }, [isFollowing]);

  // 초기 위치 설정
  useEffect(() => {
    if (initialLocation && mapRef.current) {
      console.log(
        "[useMapFocusing] Setting initial map location:",
        initialLocation
      );
      mapRef.current.animateToRegion(
        { ...initialLocation, latitudeDelta: 0.002, longitudeDelta: 0.002 },
        500
      );
    }
  }, [initialLocation]);

  // 포커스 버튼 핸들러
  const handleFocusPress = async () => {
    if (!isFollowing) {
      console.log("[useMapFocusing] Focus button pressed: enabling following");
      setIsFollowing(true);
      try {
        console.log("[useMapFocusing] Getting current position...");
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log("[useMapFocusing] Got current position:", loc.coords);
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
        console.warn(
          "[useMapFocusing] Failed to get current position, using last route coordinate",
          e
        );
        if (routeCoordinates.length > 0) {
          const last = routeCoordinates[routeCoordinates.length - 1];
          console.log("[useMapFocusing] Using last route coordinate:", last);
          mapRef.current?.animateToRegion(
            { ...last, latitudeDelta: 0.002, longitudeDelta: 0.002 },
            500
          );
        }
      }
    } else {
      console.log("[useMapFocusing] Focus button pressed: disabling following");
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
