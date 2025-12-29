// src/screens/Challenge/useChallenge.ts
import { useState, useEffect } from "react";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  level: "초급" | "중급" | "고급";
  current: number; // 현재 진행 값 (예: 7)
  total: number; // 목표 값 (예: 10)
  remainingDays: number; // 남은 시간 (예: 12)
  reward: string; // 보상 내용 (예: '배지')
  isCompleted: boolean;
}

export const useChallenge = (navigation: any) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API 호출 시뮬레이션
    const fetchChallenges = async () => {
      setLoading(true);
      // 더미 데이터
      const data: Challenge[] = [
        {
          id: "1",
          title: "5K 첫 완주",
          description: "5km 거리를 멈추지 않고 달려보세요.",
          level: "초급",
          current: 10,
          total: 10,
          remainingDays: 0,
          reward: "배지",
          isCompleted: true,
        },
        {
          id: "2",
          title: "아침형 인간",
          description: "오전 7시 이전에 3회 달리기",
          level: "중급",
          current: 2,
          total: 3,
          remainingDays: 12,
          reward: "포인트",
          isCompleted: false,
        },
        {
          id: "3",
          title: "꾸준함의 미학",
          description: "7일 연속 달리기 기록하기",
          level: "고급",
          current: 3,
          total: 7,
          remainingDays: 4,
          reward: "배지",
          isCompleted: false,
        },
      ];
      setChallenges(data);
      setLoading(false);
    };

    fetchChallenges();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleChallengeDetail = (id: string) => {
    // 상세 페이지 이동 로직 (필요 시)
    console.log(`Challenge Detail: ${id}`);
  };

  return {
    challenges,
    loading,
    handleGoBack,
    handleChallengeDetail,
  };
};
