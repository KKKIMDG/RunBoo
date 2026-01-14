// frontend/src/store/recordStore.ts

import { create } from "zustand";
import { Coordinate, getDistance } from "@/utils/runUtils";

interface RecordState {
  isReady: boolean;
  countdown: number;
  isRunning: boolean;
  isPaused: boolean;

  // [추가] 재개 직후 첫 포인트인지 체크하는 플래그
  firstPointAfterResume: boolean;
  // 재개 직후 다음 포인트는 거리 체크 완화
  secondPointAfterResume: boolean;

  // 측정 데이터
  startTime: number | null;
  pausedTime: number;
  lastPauseStartTime: number | null;

  distance: number;
  currentPace: number;
  routeCoordinates: Coordinate[];

  // 내부 계산용
  lastRawLocation: Coordinate | null;
  lastDisplayedLocation: Coordinate | null;
  currentLocation: Coordinate | null;

  // 액션들
  setReady: (ready: boolean) => void;
  setCountdown: (count: number) => void;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  updateLocation: (location: any) => void;
  reset: () => void;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  isReady: true,
  countdown: 3,
  isRunning: false,
  isPaused: false,

  // [초기화]
  firstPointAfterResume: false,
  secondPointAfterResume: false,

  startTime: null,
  pausedTime: 0,
  lastPauseStartTime: null,

  distance: 0,
  currentPace: 0,
  routeCoordinates: [],

  lastRawLocation: null,
  lastDisplayedLocation: null,
  currentLocation: null,

  setReady: (ready) => set({ isReady: ready }),
  setCountdown: (count) => set({ countdown: count }),

  startRun: () =>
    set({
      isRunning: true,
      isReady: false,
      startTime: Date.now(),
      routeCoordinates: [],
      distance: 0,
      pausedTime: 0,
      firstPointAfterResume: false,
      secondPointAfterResume: false,
    }),

  pauseRun: () =>
    set((state) => {
      console.log("[일시정지] 러닝 일시정지");
      console.log("[일시정지] 마지막 좌표:", state.lastRawLocation);
      console.log("[일시정지] 현재 거리:", state.distance.toFixed(2) + "m");
      console.log("[일시정지] 경로 포인트 수:", state.routeCoordinates.length);

      return {
        isPaused: true,
        lastPauseStartTime: Date.now(),
      };
    }),

  resumeRun: () =>
    set((state) => {
      if (!state.lastPauseStartTime) return { isPaused: false };
      const pausedDuration = Date.now() - state.lastPauseStartTime;

      console.log("[재개] 러닝 재개");
      console.log("[재개] 일시정지 전 마지막 좌표:", state.lastRawLocation);
      console.log(
        "[재개] 일시정지 시간:",
        Math.floor(pausedDuration / 1000) + "초"
      );
      console.log("[재개] 다음 위치 업데이트 대기 중...");

      return {
        isPaused: false,
        lastPauseStartTime: null,
        pausedTime: state.pausedTime + pausedDuration,
        // [중요] 재개 버튼을 누르면 "다음 위치는 무조건 인정해라"라고 표시
        firstPointAfterResume: true,
      };
    }),

  stopRun: () => set({ isRunning: false }),

  reset: () =>
    set({
      isReady: true,
      countdown: 3,
      isRunning: false,
      isPaused: false,
      firstPointAfterResume: false,
      secondPointAfterResume: false,
      startTime: null,
      pausedTime: 0,
      distance: 0,
      routeCoordinates: [],
      currentLocation: null,
      lastRawLocation: null,
    }),

  updateLocation: (location) => {
    const state = get();
    const { latitude, longitude, accuracy, speed } = location.coords;

    // 1. 정확도 필터 (15m 이상 오차 무시)
    if (accuracy && accuracy > 15) return;

    // 2. 일시정지 상태라면 위치 표시만 하고 종료
    if (!state.isRunning || state.isPaused) {
      if (state.isPaused) {
        console.log("[일시정지 중] 위치만 업데이트:", { latitude, longitude });
        console.log("[일시정지 중] 마지막 측정 좌표:", state.lastRawLocation);
      }
      set({ currentLocation: { latitude, longitude } });
      return;
    }

    // --- 러닝 중 로직 ---

    let newDistance = state.distance;
    let newPace = state.currentPace;
    let newCoordinates = [...state.routeCoordinates];
    let newDisplayedLocation = state.lastDisplayedLocation;

    // [재개 직후 첫 위치] 거리 검사 없이 좌표만 추가 (순간이동 라인 생성)
    if (state.firstPointAfterResume) {
      const currentCoord = { latitude, longitude };

      // 순간이동 라인을 위해 좌표 추가
      newCoordinates.push(currentCoord);

      console.log("=== [재개 후 첫 위치] ===");
      console.log("[재개] 일시정지 전 마지막:", state.lastRawLocation);
      console.log("[재개] 재개 후 첫 위치:", currentCoord);
      if (state.lastRawLocation) {
        const jumpDist = getDistance(
          state.lastRawLocation.latitude,
          state.lastRawLocation.longitude,
          latitude,
          longitude
        );
        console.log(
          "[재개] 순간이동 거리:",
          jumpDist.toFixed(2) + "m (측정 안 함)"
        );
      }
      console.log("[재개] 폴리라인 추가: 순간이동 라인 생성");
      console.log(
        "[재개] 다음 위치부터 거리 측정 시작 (완화된 범위: 0.5m~20m)"
      );
      console.log("========================");

      set({
        // 거리(distance)는 더하지 않음! (순간이동 했으므로)
        lastRawLocation: currentCoord, // 기준점 리셋
        lastDisplayedLocation: currentCoord,
        currentLocation: currentCoord,
        routeCoordinates: newCoordinates,
        firstPointAfterResume: false, // 첫 위치 플래그 끄기
        secondPointAfterResume: true, // 다음 위치는 두 번째 → 거리 체크 완화
      });
      return;
    }

    // --- 일반적인 이동 로직 (재개 직후가 아닐 때) ---
    if (state.lastRawLocation) {
      const rawDist = getDistance(
        state.lastRawLocation.latitude,
        state.lastRawLocation.longitude,
        latitude,
        longitude
      );

      // 재개 후 두 번째 위치는 거리 체크 완화 (바로 측정 시작)
      const minDist = state.secondPointAfterResume ? 0.5 : 1.5;
      const maxDist = state.secondPointAfterResume ? 20 : 10;

      console.log(
        `[거리측정] 이동 거리: ${rawDist.toFixed(
          2
        )}m (기준: ${minDist}m~${maxDist}m${
          state.secondPointAfterResume ? " - 재개 후 첫 측정" : ""
        })`
      );

      // 거리 체크 (재개 직후는 완화된 범위)
      if (rawDist >= minDist && rawDist < maxDist) {
        newDistance += rawDist;

        if (speed && speed > 0.2) {
          newPace = 1000 / speed;
        }

        let displayLat = latitude;
        let displayLng = longitude;

        // 스무딩
        if (state.lastDisplayedLocation) {
          displayLat =
            state.lastDisplayedLocation.latitude * 0.6 + latitude * 0.4;
          displayLng =
            state.lastDisplayedLocation.longitude * 0.6 + longitude * 0.4;
        }

        const smoothedCoords = { latitude: displayLat, longitude: displayLng };

        newCoordinates.push(smoothedCoords);
        newDisplayedLocation = smoothedCoords;

        console.log(
          `[거리측정] ✅ 인정 - 누적 거리: ${newDistance.toFixed(2)}m`
        );

        set({
          distance: newDistance,
          currentPace: newPace,
          routeCoordinates: newCoordinates,
          lastRawLocation: { latitude, longitude },
          lastDisplayedLocation: newDisplayedLocation,
          currentLocation: smoothedCoords,
          secondPointAfterResume: false, // 정상 측정 시작했으므로 플래그 끄기
        });
      } else {
        console.log(
          `[거리측정] ❌ 무시 - 범위 벗어남 (${
            rawDist < minDist ? "너무 가까움" : "너무 멂"
          })`
        );
      }
    } else {
      // 진짜 처음 시작
      const firstLoc = { latitude, longitude };
      set({
        lastRawLocation: firstLoc,
        lastDisplayedLocation: firstLoc,
        currentLocation: firstLoc,
        routeCoordinates: [firstLoc],
      });
    }
  },
}));
