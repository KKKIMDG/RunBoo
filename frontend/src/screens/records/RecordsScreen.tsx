//frontend/src/screens/records/RecordsScreen.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";

import SummaryCards from "../stats/components/SummaryCards";
import WeeklyChart from "../stats/components/WeeklyChart";
import PersonalBestList from "../stats/components/PersonalBestList";

import { fetchMyRecords, fetchDashboardStats } from "@/services/record/recordsService";
import { DEFAULT_USER_ID } from "@/constants/env";
import type { RecordDto, DashboardStatsDto } from "@/types/record";

import { styles as s } from "./RecordsScreen.style";

type TopTab = "record" | "stats";

// 탭 네비게이터 밖에서도 안전하게 처리
function useSafeBottomTabBarHeight() {
    try {
        return useBottomTabBarHeight();
    } catch {
        return 0;
    }
}

export default function RecordsScreen() {
    const tabBarHeight = useSafeBottomTabBarHeight();
    const userId = DEFAULT_USER_ID;

    const [activeTab, setActiveTab] = useState<TopTab>("record");

    // 기록 상태
    const [recordsLoading, setRecordsLoading] = useState(true);
    const [recordsRefreshing, setRecordsRefreshing] = useState(false);
    const [records, setRecords] = useState<RecordDto[]>([]);
    const [recordsError, setRecordsError] = useState<string | null>(null);

    // 통계 상태
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsRefreshing, setStatsRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    const loadRecords = useCallback(async () => {
        try {
            setRecordsError(null);
            const res = await fetchMyRecords(userId);
            setRecords(res);
        } catch (e) {
            console.log("❌ records api error:", e);
            setRecordsError("기록을 불러오지 못했어요.");
            setRecords([]);
        }
    }, [userId]);

    const loadStats = useCallback(async () => {
        try {
            setStatsError(null);
            const res = await fetchDashboardStats(userId);
            setStats(res);
        } catch (e) {
            console.log("❌ stats api error:", e);
            setStatsError("통계를 불러오지 못했어요.");
            setStats(null);
        }
    }, [userId]);

    useEffect(() => {
        (async () => {
            try {
                await Promise.all([loadRecords(), loadStats()]);
            } finally {
                setRecordsLoading(false);
                setStatsLoading(false);
            }
        })();
    }, [loadRecords, loadStats]);

    const handleChangeTopTab = (v: "left" | "right") => {
        setActiveTab(v === "left" ? "record" : "stats");
    };

    const segmentedValue: "left" | "right" =
        activeTab === "record" ? "left" : "right";

    const currentLoading =
        activeTab === "record" ? recordsLoading : statsLoading;

    if (currentLoading) {
        return (
            <View style={s.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <SafeAreaView style={s.safeArea}>
            <View style={s.container}>
                <Text style={s.title}>
                    {activeTab === "record" ? "기록" : "통계"}
                </Text>
                <Text style={s.subTitle}>
                    {activeTab === "record" ? "나의 러닝 기록" : "나의 러닝 통계"}
                </Text>

                <View style={{ marginVertical: 12 }}>
                    <Segmented
                        leftLabel="기록"
                        rightLabel="통계"
                        value={segmentedValue}
                        onChange={handleChangeTopTab}
                    />
                </View>

                {activeTab === "record" && (
                    <>
                        {recordsError && (
                            <Text style={s.errorText}>{recordsError}</Text>
                        )}

                        <FlatList
                            data={records}
                            keyExtractor={(it) => String(it.id)}
                            renderItem={({ item }) => <RecordCard item={item} />}
                            refreshControl={
                                <RefreshControl
                                    refreshing={recordsRefreshing}
                                    onRefresh={async () => {
                                        setRecordsRefreshing(true);
                                        try {
                                            await loadRecords();
                                        } finally {
                                            setRecordsRefreshing(false);
                                        }
                                    }}
                                />
                            }
                            ListEmptyComponent={
                                <View style={{ paddingTop: 40 }}>
                                    <Text style={s.emptyText}>
                                        아직 러닝 기록이 없어요.
                                    </Text>
                                </View>
                            }
                            contentContainerStyle={{
                                paddingBottom: tabBarHeight + 24,
                            }}
                        />
                    </>
                )}

                {activeTab === "stats" && (
                    <>
                        {statsError && (
                            <Text style={s.errorText}>{statsError}</Text>
                        )}

                        <FlatList
                            data={[]}
                            renderItem={null}
                            ListHeaderComponent={
                                stats && (
                                    <>
                                        <SummaryCards monthly={stats.monthly} />
                                        <WeeklyChart weekly={stats.weekly} />
                                        <PersonalBestList pb={stats.personalBests} />
                                    </>
                                )
                            }
                            refreshControl={
                                <RefreshControl
                                    refreshing={statsRefreshing}
                                    onRefresh={async () => {
                                        setStatsRefreshing(true);
                                        try {
                                            await loadStats();
                                        } finally {
                                            setStatsRefreshing(false);
                                        }
                                    }}
                                />
                            }
                            contentContainerStyle={{
                                paddingBottom: tabBarHeight,
                            }}
                        />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
