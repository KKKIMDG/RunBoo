// frontend/src/store/recordStore.ts

import { create } from 'zustand';
import { Coordinate, getDistance } from '@/utils/runUtils';

interface RecordState {
    isReady: boolean;
    countdown: number;
    isRunning: boolean;
    isPaused: boolean;
    
    // 측정 데이터
    startTime: number | null;     // 시작 시간 (타임스탬프)
    pausedTime: number;           // 일시정지된 총 시간 (ms)
    lastPauseStartTime: number | null; // 현재 일시정지 시작 시간
    
    distance: number;             // 총 거리 (m)
    currentPace: number;          // 현재 페이스 (초/km)
    routeCoordinates: Coordinate[]; // 이동 경로
    
    // 내부 계산용 (UI 렌더링 X)
    lastRawLocation: Coordinate | null;
    lastDisplayedLocation: Coordinate | null;
    currentLocation: Coordinate | null;

    // 액션
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
        pausedTime: 0
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
            pausedTime: state.pausedTime + pausedDuration
        };
    }),

    stopRun: () => set({ isRunning: false }),

    reset: () => set({
        isReady: true,
        countdown: 3,
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedTime: 0,
        distance: 0,
        routeCoordinates: [],
        currentLocation: null,
        lastRawLocation: null
    }),

    updateLocation: (location) => {
        const state = get();
        
        // 1. 러닝 중이 아니거나 일시정지 중이면 위치 업데이트만 하고 종료 (경로 기록 X)
        if (!state.isRunning || state.isPaused) {
             set({ 
                currentLocation: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                }
             });
             return;
        }

        const { latitude, longitude, accuracy, speed } = location.coords;

        // 2. 정확도 필터 (15m 이상 오차 무시)
        if (accuracy && accuracy > 15) return;

        // 3. 비정상 속도 필터 (시속 25km/h 이상 무시)
        if (speed !== null && speed > 7.0) return;

        // 4. 거리 계산 및 스무딩 로직
        let newDistance = state.distance;
        let newPace = state.currentPace;
        let newCoordinates = [...state.routeCoordinates];
        let newRawLocation = state.lastRawLocation;
        let newDisplayedLocation = state.lastDisplayedLocation;

        if (state.lastRawLocation) {
            const rawDist = getDistance(
                state.lastRawLocation.latitude,
                state.lastRawLocation.longitude,
                latitude,
                longitude
            );

            // 제자리 떨림(1.5m 미만) 무시, 10m 이상 점프 무시
            if (rawDist >= 1.5 && rawDist < 10) {
                newDistance += rawDist;

                // 페이스 계산 (0.2m/s 이상일 때만)
                if (speed && speed > 0.2) {
                    newPace = 1000 / speed;
                }

                let displayLat = latitude;
                let displayLng = longitude;

                // 스무딩 (이전 60%, 현재 40%)
                if (state.lastDisplayedLocation) {
                    displayLat = state.lastDisplayedLocation.latitude * 0.6 + latitude * 0.4;
                    displayLng = state.lastDisplayedLocation.longitude * 0.6 + longitude * 0.4;
                }

                const smoothedCoords = { latitude: displayLat, longitude: displayLng };
                
                newCoordinates.push(smoothedCoords);
                newDisplayedLocation = smoothedCoords;
                newRawLocation = { latitude, longitude };
                
                set({
                    distance: newDistance,
                    currentPace: newPace,
                    routeCoordinates: newCoordinates,
                    lastRawLocation: newRawLocation,
                    lastDisplayedLocation: newDisplayedLocation,
                    currentLocation: smoothedCoords
                });
            }
        } else {
            // 첫 위치
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