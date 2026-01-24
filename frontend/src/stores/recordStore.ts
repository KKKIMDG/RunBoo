// frontend/src/store/recordStore.ts

import { create } from "zustand";
import { Coordinate, getDistance } from "@/utils/runUtils";
import { trackArray } from "@/utils/performanceLogger";

const MAX_SPEED_MPS = 6.94; // 🚫 시속 25km 제한

/**
 * 러닝 측정 상태를 전담하는 Zustand Store
 * - 러닝 시작 / 일시정지 / 재개 / 종료 상태 관리
 * - GPS 좌표를 기반으로 거리, 페이스, 경로 계산
 */
interface RecordState {
  /** 러닝 시작 준비 상태 (카운트다운 전) */
  isReady: boolean;

  /** 시작 전 카운트다운 숫자 */
  countdown: number;

  /** 러닝이 실제로 시작되었는지 */
  isRunning: boolean;

  /** 일시정지 상태인지 */
  isPaused: boolean;

  /**
   * [중요]
   * 일시정지 후 재개했을 때
   * "첫 번째 들어오는 GPS 포인트"인지 여부
   * → 이 포인트는 거리 계산을 하지 않고 기준점만 리셋
   */
  firstPointAfterResume: boolean;

  /**
   * 재개 후 두 번째 GPS 포인트인지 여부
   * → 이 포인트부터는 거리 측정은 하되
   *    기준을 완화해서 바로 측정 시작
   */
  secondPointAfterResume: boolean;

  /** 러닝 시작 시각 (timestamp) */
  startTime: number | null;

  /** 누적 일시정지 시간(ms) */
  pausedTime: number;

  /** 마지막으로 일시정지를 누른 시각 */
  lastPauseStartTime: number | null;

  /** 누적 이동 거리 (m) */
  distance: number;

  /** 현재 페이스 (초 / km) */
  currentPace: number;

  /** 지도에 그릴 폴리라인 좌표 배열 */
  routeCoordinates: Coordinate[];

  /** 실제 GPS 원본 좌표 (거리 계산 기준) */
  lastRawLocation: Coordinate | null;

  /** 지도에 표시되는 스무딩된 좌표 */
  lastDisplayedLocation: Coordinate | null;

  /** 현재 사용자 위치 (지도 센터용) */
  currentLocation: Coordinate | null;

  /* ===== Actions ===== */

  setReady: (ready: boolean) => void;
  setCountdown: (count: number) => void;

  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;

  /** GPS 위치 업데이트 진입점 */
  updateLocation: (location: any) => void;

  /** 모든 상태 초기화 */
  reset: () => void;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  /* ================= 초기 상태 ================= */

  isReady: true,
  countdown: 3,
  isRunning: false,
  isPaused: false,

  // 재개 관련 플래그 초기값
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

  /* ================= 기본 상태 변경 ================= */

  setReady: (ready) => set({ isReady: ready }),
  setCountdown: (count) => set({ countdown: count }),

  /**
   * 러닝 시작
   * - 거리, 경로, 시간 전부 초기화
   */
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

  /**
   * 러닝 일시정지
   * - 위치 업데이트는 계속 되지만
   * - 거리 계산은 중단됨
   */
  pauseRun: () =>
    set(() => ({
      isPaused: true,
      lastPauseStartTime: Date.now(),
    })),

  /**
   * 러닝 재개
   * - 일시정지 시간 누적
   * - 다음 GPS 포인트를 "무조건 인정"하도록 플래그 설정
   */
  resumeRun: () =>
    set((state) => {
      if (!state.lastPauseStartTime) return { isPaused: false };

      const pausedDuration = Date.now() - state.lastPauseStartTime;

      return {
        isPaused: false,
        lastPauseStartTime: null,
        pausedTime: state.pausedTime + pausedDuration,

        /**
         * 재개 버튼을 누른 직후
         * → 다음 위치는 거리 계산 없이 기준점으로 사용
         */
        firstPointAfterResume: true,
      };
    }),

  stopRun: () => set({ isRunning: false }),

  /**
   * 모든 상태 완전 초기화
   */
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

  /* ================= GPS 위치 업데이트 핵심 로직 ================= */

  updateLocation: (location) => {
    const state = get();
    const { latitude, longitude, accuracy, speed } = location.coords;

    /**
     * 1️⃣ GPS 정확도 필터
     * - 정확도 30m 초과는 신뢰 불가 → 무시
     */
    if (accuracy && accuracy > 30) return;

    // 2️⃣ 속도 제한 (시속 25km 초과 컷)
    if (speed && speed > MAX_SPEED_MPS) {
      return;
    }

    /**
     * 2️⃣ 러닝 중이 아니거나 일시정지 상태
     * - 지도 위치만 업데이트
     * - 거리, 경로 계산은 하지 않음
     */
    if (!state.isRunning || state.isPaused) {
      set({ currentLocation: { latitude, longitude } });
      return;
    }

    /* ===== 러닝 중 ===== */

    let newDistance = state.distance;
    let newPace = state.currentPace;
    let newCoordinates = [...state.routeCoordinates];
    let newDisplayedLocation = state.lastDisplayedLocation;

    /**
     * 3️⃣ 재개 직후 첫 GPS 포인트
     * - 거리 계산 ❌
     * - 기준 좌표만 리셋
     * - 지도에는 "순간이동 선"을 만들기 위해 좌표 추가
     */
    if (state.firstPointAfterResume) {
      const currentCoord = { latitude, longitude };

      newCoordinates.push(currentCoord);

      set({
        lastRawLocation: currentCoord,
        lastDisplayedLocation: currentCoord,
        currentLocation: currentCoord,
        routeCoordinates: newCoordinates,
        firstPointAfterResume: false,
        secondPointAfterResume: true,
      });
      return;
    }

    /**
     * 4️⃣ 일반 이동 처리
     */
    if (state.lastRawLocation) {
      const rawDist = getDistance(
        state.lastRawLocation.latitude,
        state.lastRawLocation.longitude,
        latitude,
        longitude,
      );

      /**
       * 재개 직후 두 번째 포인트는 기준 완화
       * - 너무 짧은 흔들림 제거
       * - 순간이동 방지
       */
      const minDist = state.secondPointAfterResume ? 1.0 : 1.2;
      const maxDist = state.secondPointAfterResume ? 100 : 50;

      if (rawDist >= minDist && rawDist < maxDist) {
        newDistance += rawDist;

        /**
         * speed 기반 페이스 계산
         */
        if (speed && speed > 0.2) {
          newPace = 1000 / speed;
        }

        /**
         * 지도 좌표 스무딩
         * - 급격한 GPS 튐 완화
         */
        let displayLat = latitude;
        let displayLng = longitude;

        if (state.lastDisplayedLocation) {
          displayLat =
            state.lastDisplayedLocation.latitude * 0.6 + latitude * 0.4;
          displayLng =
            state.lastDisplayedLocation.longitude * 0.6 + longitude * 0.4;
        }

        const smoothedCoords = { latitude: displayLat, longitude: displayLng };

        newCoordinates.push(smoothedCoords);
        newDisplayedLocation = smoothedCoords;

        /**
         * 성능 추적 (좌표 5000개 단위)
         */
        trackArray("routeCoordinates", newCoordinates.length, 5000);

        set({
          distance: newDistance,
          currentPace: newPace,
          routeCoordinates: newCoordinates,
          lastRawLocation: { latitude, longitude },
          lastDisplayedLocation: newDisplayedLocation,
          currentLocation: smoothedCoords,
          secondPointAfterResume: false,
        });
      }
    } else {
      /**
       * 5️⃣ 러닝 시작 후 진짜 첫 GPS 포인트
       */
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
