import { useState, useEffect, useCallback } from "react";
import { fetchUserBadges } from "@/services/badge/badgeService";
import type { UserBadgeDto } from "@/types/badge";

export const useBadge = () => {
    const [badges, setBadges] = useState<UserBadgeDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadBadges = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchUserBadges();
            setBadges(data ?? []);
        } catch (err: any) {
            console.error("배지 목록 로드 실패:", err);
            setError(err.message ?? "배지를 불러오는 중 오류 발생");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBadges();
    }, [loadBadges]);

    return {
        badges,              // ✅ UserBadgeDto[]
        loading,
        error,
        refresh: loadBadges,
        badgeCount: badges.length,
    };
};