import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 1. 저장할 데이터 타입 정의
export interface TierMeasurementResult {
  type: "5K" | "10K"; // 측정 종류
  time: number; // 걸린 시간 (초)
  distance: number; // 달린 거리 (미터)
  date: string; // 측정 날짜 (ISO 8601 형식)
}

// 2. Store의 상태와 액션 정의
interface TierResultState {
  unsyncedResults: TierMeasurementResult[];
  addResult: (result: TierMeasurementResult) => void;
  clearResults: () => void;
}

// 3. Zustand Store 생성 (persist 미들웨어 적용)
export const useTierResultStore = create<TierResultState>()(
  persist(
    (set) => ({
      unsyncedResults: [],
      // 새 측정 결과를 배열에 추가하는 액션
      addResult: (result) =>
        set((state) => ({
          unsyncedResults: [...state.unsyncedResults, result],
        })),
      // 모든 미동기화 결과를 비우는 액션
      clearResults: () => set({ unsyncedResults: [] }),
    }),
    {
      name: "tier-result-storage", // AsyncStorage에 저장될 고유 키
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
