import { useState, useEffect, useCallback } from "react";
import { fetchUserBadges } from "@/services/badge/badgeService";
import {BadgeDto, UserBadgeDto} from "@/types/badge";

export const useProfile = () => {
  const [badges, setBadges] = useState<UserBadgeDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 서버에서 유저의 배지 목록 가져오기
      const badgeData = await fetchUserBadges();
      setBadges(badgeData);
    } catch (error) {
      console.error("프로필 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  return {
    badges,
    badgeCount: badges.length, // 배지 개수 동적 계산
    loading,
    refresh: loadProfileData,
  };
};
