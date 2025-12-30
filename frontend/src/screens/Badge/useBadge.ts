import { useState, useEffect, useCallback } from "react";
import { fetchUserBadges } from "@/services/badge/badgeService";
import type { BadgeDto } from "@/types/badge";

export const useBadge = (userId: number = 1) => {
  const [badges, setBadges] = useState<BadgeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 서버로부터 배지 목록을 불러오는 함수
   */
  const loadBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ badgeService의 fetchUserBadges 호출
      const data = await fetchUserBadges(userId);
      setBadges(data);
    } catch (err: any) {
      console.error("배지 목록 로드 실패:", err);
      setError(err.message || "배지를 불러오는 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  return {
    badges,
    loading,
    error,
    refresh: loadBadges, // 필요한 경우 수동 새로고침 지원
    badgeCount: badges.length,
  };
};
