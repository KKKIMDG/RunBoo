
import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/navigation/MainStackNavigator";
import { fetchDashboardStats } from '@/services/record/records';
import { DEFAULT_USER_ID } from '@/constants/env';
import type { DashboardStatsDto } from '@/types/record';

export function useStatsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [tab, setTab] = useState<"left" | "right">("right");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchData = useCallback(async () => {
        try {
            setErrorMsg("");
            const data = await fetchDashboardStats(DEFAULT_USER_ID);
            setStats(data);
        } catch (e) {
            console.error(e);
            setErrorMsg("통계 정보를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleChangeTab = (v: "left" | "right") => {
        setTab(v);
        if (v === "left") {
            navigation.navigate("Records");
        }
    };

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
