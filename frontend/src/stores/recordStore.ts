// frontend/src/store/recordStore.ts

import { create } from 'zustand';
import { Coordinate, getDistance } from '@/utils/runUtils';

interface RecordState {
    isReady: boolean;
    countdown: number;
    isRunning: boolean;
    isPaused: boolean;

    // [추가] 재개 직후 첫 포인트인지 체크하는 플래그
    firstPointAfterResume: boolean;

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

    startRun: () => set({
        isRunning: true,
        isReady: false,
        startTime: Date.now(),
        routeCoordinates: [],
        distance: 0,
        pausedTime: 0,
        firstPointAfterResume: false
    }),

    pauseRun: () => set((state) => ({
        isPaused: true,
        lastPauseStartTime: Date.now()
    })),

    resumeRun: () => set((state) => {
        if (!state.lastPauseStartTime) return { isPaused: false };
        const pausedDuration = Date.now() - state.lastPauseStartTime;
        return {
            isPaused: false,
            lastPauseStartTime: null,
            pausedTime: state.pausedTime + pausedDuration,
            // [중요] 재개 버튼을 누르면 "다음 위치는 무조건 인정해라"라고 표시
            firstPointAfterResume: true
        };
    }),

    stopRun: () => set({ isRunning: false }),

    reset: () => set({
        isReady: true,
        countdown: 3,
        isRunning: false,
        isPaused: false,
        firstPointAfterResume: false,
        startTime: null,
        pausedTime: 0,
        distance: 0,
        routeCoordinates: [],
        currentLocation: null,
        lastRawLocation: null
    }),

    updateLocation: (location) => {
        const state = get();
        const { latitude, longitude, accuracy, speed } = location.coords;

        // 1. 정확도 필터 (15m 이상 오차 무시)
        if (accuracy && accuracy > 15) return;

        // 2. 일시정지 상태라면 위치 표시만 하고 종료
        if (!state.isRunning || state.isPaused) {
            set({ currentLocation: { latitude, longitude } });
            return;
        }

        // --- 러닝 중 로직 ---

        let newDistance = state.distance;
        let newPace = state.currentPace;
        let newCoordinates = [...state.routeCoordinates];
        let newDisplayedLocation = state.lastDisplayedLocation;

        // [수정 핵심] 재개 직후라면 거리 검사 없이 기준점 강제 업데이트
        if (state.firstPointAfterResume) {
            const currentCoord = { latitude, longitude };

            // 시각적으로 경로를 끊기지 않게 연결하려면 push (원치 않으면 생략 가능)
            newCoordinates.push(currentCoord);

            set({
                // 거리(distance)는 더하지 않음! (순간이동 했으므로)
                lastRawLocation: currentCoord,        // 기준점 리셋 (여기서부터 다시 10m 체크 시작)
                lastDisplayedLocation: currentCoord,
                currentLocation: currentCoord,
                routeCoordinates: newCoordinates,
                firstPointAfterResume: false // 플래그 끄기
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

            // 1.5m ~ 10m 사이만 인정
            if (rawDist >= 1.5 && rawDist < 10) {
                newDistance += rawDist;

                if (speed && speed > 0.2) {
                    newPace = 1000 / speed;
                }

                let displayLat = latitude;
                let displayLng = longitude;

                // 스무딩
                if (state.lastDisplayedLocation) {
                    displayLat = state.lastDisplayedLocation.latitude * 0.6 + latitude * 0.4;
                    displayLng = state.lastDisplayedLocation.longitude * 0.6 + longitude * 0.4;
                }

                const smoothedCoords = { latitude: displayLat, longitude: displayLng };

                newCoordinates.push(smoothedCoords);
                newDisplayedLocation = smoothedCoords;

                set({
                    distance: newDistance,
                    currentPace: newPace,
                    routeCoordinates: newCoordinates,
                    lastRawLocation: { latitude, longitude },
                    lastDisplayedLocation: newDisplayedLocation,
                    currentLocation: smoothedCoords
                });
            }
        } else {
            // 진짜 처음 시작
            const firstLoc = { latitude, longitude };
            set({
                lastRawLocation: firstLoc,
                lastDisplayedLocation: firstLoc,
                currentLocation: firstLoc,
                routeCoordinates: [firstLoc]
            });
        }
    }
}));