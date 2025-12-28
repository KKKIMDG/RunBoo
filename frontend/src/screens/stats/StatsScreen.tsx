//frontend/src/screens/stats/StatsScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { fetchDashboardStats } from "@/services/record/recordsService";
import { DEFAULT_USER_ID } from "@/constants/env";
import type { DashboardStatsDto } from "@/types/record";

import MonthlyChart from "./components/MonthlyChart";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";

import { styles as s } from "./StatsScreen.style";

export default function StatsScreen() {
    const tabBarHeight = useBottomTabBarHeight();
    const userId = DEFAULT_USER_ID;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setErrorMsg(null);
            const res = await fetchDashboardStats(userId);
            setStats(res);
        } catch (e) {
            console.log("❌ stats api error:", e);
            setErrorMsg("통계를 불러오지 못했어요.");
            setStats(null);
        }
    }, [userId]);

    useEffect(() => {
        (async () => {
            try {
                await load();
            } finally {
                setLoading(false);
            }
        })();
    }, [load]);

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.safeArea}>
            <View style={s.container}>
                <Text style={s.title}>통계</Text>
                <Text style={s.subTitle}>나의 러닝 통계</Text>

                {errorMsg && (
                    <Text style={s.errorText}>{errorMsg}</Text>
                )}

                <FlatList
                    data={[]}
                    renderItem={null}
                    ListHeaderComponent={
                        stats && (
                            <>
                                <MonthlyChart monthly={stats.monthly} />
                                <WeeklyChart weekly={stats.weekly} />
                                <PersonalBestList
                                    pb={stats.personalBests}
                                />
                            </>
                        )
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true);
                                try {
                                    await load();
                                } finally {
                                    setRefreshing(false);
                                }
                            }}
                        />
                    }
                    contentContainerStyle={{
                        paddingBottom: tabBarHeight,
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
