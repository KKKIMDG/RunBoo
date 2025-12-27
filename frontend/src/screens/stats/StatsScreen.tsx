import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { fetchDashboardStats } from "@/services/record/recordsService";
import { DEFAULT_USER_ID } from "@/constants/env";
import type { DashboardStatsDto } from "@/types/record";

import SummaryCards from "./components/SummaryCards";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";

export default function StatsScreen() {
    const tabBarHeight = useBottomTabBarHeight();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const userId = DEFAULT_USER_ID;

    const load = useCallback(async () => {
        try {
            setErrorMsg(null);
            const res = await fetchDashboardStats(userId);
            setStats(res);
        } catch (e) {
            console.log("❌ stats api error:", e);
            setErrorMsg("통계를 불러오지 못했어요. 네트워크/서버 상태를 확인해주세요.");
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
        <View style={s.container}>
            <Text style={s.title}>통계</Text>
            <Text style={s.subTitle}>나의 러닝 통계</Text>

            {errorMsg && (
                <View style={{ paddingVertical: 10 }}>
                    <Text style={{ color: "#EF4444", fontWeight: "700" }}>{errorMsg}</Text>
                </View>
            )}

            <ScrollView
                // ✅ 하단 탭바 높이만큼 여백 확보
                contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
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
            >
                {stats && (
                    <>
                        <SummaryCards monthly={stats.monthly} />
                        <WeeklyChart weekly={stats.weekly} />
                        <PersonalBestList pb={stats.personalBests} />
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
        backgroundColor: "#F5F7FB",
    },
    title: { fontSize: 22, fontWeight: "900", color: "#111827" },
    subTitle: { marginTop: 4, color: "#6B7280", fontWeight: "600" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
});