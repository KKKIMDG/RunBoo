// src/screens/Challenge/useChallenge.ts
import { useState, useEffect } from 'react';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 ~ 100
  isCompleted: boolean;
  image: string;
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
        { id: '1', title: '5K 첫 완주', description: '5km 거리를 멈추지 않고 달려보세요.', progress: 100, isCompleted: true, image: '🏆' },
        { id: '2', title: '아침형 인간', description: '오전 7시 이전에 3회 달리기', progress: 66, isCompleted: false, image: '🌅' },
        { id: '3', title: '꾸준함의 미학', description: '7일 연속 달리기 기록하기', progress: 30, isCompleted: false, image: '🔥' },
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