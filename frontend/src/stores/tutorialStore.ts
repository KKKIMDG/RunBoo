// src/stores/tutorialStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TutorialState {
  // 온보딩 완료 여부
  hasSeenOnboarding: boolean;

  // 각 화면별 튜토리얼 완료 여부
  hasSeenHomeTutorial: boolean;
  hasSeenProfileTutorial: boolean;
  hasSeenChallengeTutorial: boolean;

  // 액션들
  markOnboardingComplete: () => void;
  markHomeTutorialComplete: () => void;
  markProfileTutorialComplete: () => void;
  markChallengeTutorialComplete: () => void;

  // 튜토리얼 전체 리셋 (테스트용 또는 설정에서 "다시보기")
  resetAllTutorials: () => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      // 초기값: 모두 false
      hasSeenOnboarding: false,
      hasSeenHomeTutorial: false,
      hasSeenProfileTutorial: false,
      hasSeenChallengeTutorial: false,

      // 온보딩 완료 표시
      markOnboardingComplete: () => set({ hasSeenOnboarding: true }),

      // 각 화면별 튜토리얼 완료 표시
      markHomeTutorialComplete: () => set({ hasSeenHomeTutorial: true }),
      markProfileTutorialComplete: () => set({ hasSeenProfileTutorial: true }),
      markChallengeTutorialComplete: () =>
        set({ hasSeenChallengeTutorial: true }),

      // 모든 튜토리얼 상태 리셋
      resetAllTutorials: () =>
        set({
          hasSeenOnboarding: false,
          hasSeenHomeTutorial: false,
          hasSeenProfileTutorial: false,
          hasSeenChallengeTutorial: false,
        }),
    }),
    {
      name: "tutorial-storage", // AsyncStorage 키 이름
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
