import { useState, useEffect, useCallback } from "react";
import { fetchUserChallengesByStatus } from "@/services/challenge/ChallengeService";
import type { UserChallengeDto } from "@/types/challenge";
import { useFocusEffect } from "@react-navigation/native"; // 추가

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

export const useChallenge = (navigation: any) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [status, setStatus] = useState<"IN_PROGRESS" | "COMPLETED">(
    "IN_PROGRESS"
  );
  const [loading, setLoading] = useState(true);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const data: UserChallengeDto[] = await fetchUserChallengesByStatus(
        status
      );

      const formattedData: Challenge[] = data.map((item) => ({
        id: String(item.userChallengeId),
        title: item.challenge?.title || "제목 없음",
        description: item.challenge?.description || "설명이 없습니다.",
        level:
          item.challenge?.difficulty === "EASY"
            ? "초급"
            : item.challenge?.difficulty === "NORMAL"
            ? "중급"
            : "고급",
        current: item.progressValue,
        total: Number(item.challenge?.targetValue || 0),
        remainingDays: item.remainingDays,
        reward: item.challenge?.badge ? item.challenge.badge.name : "보상 없음",
        isCompleted: item.status === "COMPLETED",
        percent: item.percentage || 0,
      }));

      setChallenges(formattedData);
    } catch (error) {
      console.error("챌린지 로드 중 에러 발생:", error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  // ✅ 추가: 화면에 들어올 때마다(포커스 될 때마다) 데이터를 새로고침함
  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges])
  );

  const toggleStatus = (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    setStatus(newStatus);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    challenges,
    loading,
    status,
    toggleStatus,
    handleGoBack,
    refresh: loadChallenges,
  };
};
