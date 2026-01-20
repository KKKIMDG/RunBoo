// 챌린지 관련 타입 정의
export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: string;
  current: number;
  total: number;
  remainingDays: number;
  reward: string;
  isCompleted: boolean;
  percent: number;
}

// 향후 백엔드 연동 시 사용할 Hook
export const useChallenge = () => {
  // TODO: 백엔드 API 연동
  return {
    challenges: [],
    loading: false,
    status: "IN_PROGRESS" as "IN_PROGRESS" | "COMPLETED",
  };
};
