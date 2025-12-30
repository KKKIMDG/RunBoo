import { useState, useEffect, useCallback } from "react";
import { fetchUserChallengesByStatus } from "@/services/challenge/challengeService";
import type { UserChallengeDto } from "@/types/challenge";

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

  const FIXED_USER_ID = 1;

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const data: UserChallengeDto[] = await fetchUserChallengesByStatus(
        FIXED_USER_ID,
        status
      );

      // ✅ 서버 JSON 필드명에 맞춰서 매핑 수정
      const formattedData: Challenge[] = data.map((item) => ({
        id: String(item.userChallengeId),
        // challengeDto -> challenge
        title: item.challenge?.title || "제목 없음",
        description: item.challenge?.description || "설명이 없습니다.",
        level:
          item.challenge?.difficulty === "EASY"
            ? "초급"
            : item.challenge?.difficulty === "NORMAL"
            ? "중급"
            : "고급",
        current: item.progressValue,
        // 문자열로 오는 targetValue를 숫자로 변환
        total: Number(item.challenge?.targetValue || 0),
        remainingDays: item.remainingDays,
        // badgeDto -> badge
        reward: item.challenge?.badge ? item.challenge.badge.name : "보상 없음",
        isCompleted: item.status === "COMPLETED",
        // percent -> percentage (서버 응답 기준)
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

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

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
