import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDashboardStats } from "@/services/record/records";
import type { DashboardStatsDto } from "@/types/record";

export function useStatsScreen() {
    const [tab, setTab] = useState<"left" | "right">("right");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [userId, setUserId] = useState<number | null>(null);

    // ✅ userId 로드
    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem("userId");
            const parsed = raw ? Number(raw) : null;
            setUserId(Number.isFinite(parsed) ? parsed : null);
        })();
    }, []);

    const fetchData = useCallback(async () => {
        if (userId == null) return;

        try {
            setErrorMsg(null);
            const data = await fetchDashboardStats(userId);
            setStats(data);
        } catch (e) {
            console.log("❌ stats api error:", e);
            setStats(null);
            setErrorMsg("통계 정보를 불러오지 못했어요. 네트워크/서버 상태를 확인해줘.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId == null) return;
        setLoading(true);
        fetchData();
    }, [userId, fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleChangeTab = useCallback((v: "left" | "right") => {
        // ✅ StatsScreen은 통계 화면 전용: 기록(left) 눌러도 여기서는 이동하지 않음
        if (v === "left") {
            setTab("right");
            return;
        }
        setTab("right");
    }, []);

    return {
        tab,
        loading,
        refreshing,
        stats,
        errorMsg,
        handlers: {
            onRefresh,
            handleChangeTab,
        },
    };
}
