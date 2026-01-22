// src/hooks/useTutorial.ts

import { useEffect } from "react";
import { useTutorialStore } from "@/stores/tutorialStore";

/**
 * 튜토리얼 관련 로직을 관리하는 커스텀 훅
 */
export function useTutorial() {
  const {
    hasSeenOnboarding,
    hasSeenHomeTutorial,
    hasSeenProfileTutorial,
    hasSeenChallengeTutorial,
    markOnboardingComplete,
    markHomeTutorialComplete,
    markProfileTutorialComplete,
    markChallengeTutorialComplete,
    resetAllTutorials,
  } = useTutorialStore();

  /**
   * 온보딩을 건너뛰거나 완료
   */
  const completeOnboarding = () => {
    markOnboardingComplete();
  };

  /**
   * 특정 화면의 튜토리얼 완료
   */
  const completeTutorial = (screen: "home" | "profile" | "challenge") => {
    switch (screen) {
      case "home":
        markHomeTutorialComplete();
        break;
      case "profile":
        markProfileTutorialComplete();
        break;
      case "challenge":
        markChallengeTutorialComplete();
        break;
    }
  };

  /**
   * 모든 튜토리얼이 완료되었는지 확인
   */
  const hasCompletedAllTutorials =
    hasSeenOnboarding &&
    hasSeenHomeTutorial &&
    hasSeenProfileTutorial &&
    hasSeenChallengeTutorial;

  return {
    // 상태
    hasSeenOnboarding,
    hasSeenHomeTutorial,
    hasSeenProfileTutorial,
    hasSeenChallengeTutorial,
    hasCompletedAllTutorials,

    // 액션
    completeOnboarding,
    completeTutorial,
    resetAllTutorials,
  };
}
