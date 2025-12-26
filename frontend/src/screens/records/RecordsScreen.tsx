import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from "react-native";

import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";

import SummaryCards from "../stats/components/SummaryCards";
import WeeklyChart from "../stats/components/WeeklyChart";
import PersonalBestList from "../stats/components/PersonalBestList";

import { fetchMyRecords, fetchDashboardStats } from "../../services/record/records";
import { DEFAULT_USER_ID } from "../../constants/env";
import type { RecordDto, DashboardStatsDto } from "../../types/record";

type TopTab = "record" | "stats";

export default function RecordsScreen() {
    const [activeTab, setActiveTab] = useState<TopTab>("record");

    // 기록 데이터 상태
    const [recordsLoading, setRecordsLoading] = useState(true);
    const [recordsRefreshing, setRecordsRefreshing] = useState(false);
    const [records, setRecords] = useState<RecordDto[]>([]);
    const [recordsError, setRecordsError] = useState<string | null>(null);

    // 통계 데이터 상태
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsRefreshing, setStatsRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    const userId = DEFAULT_USER_ID;

    const loadRecords = useCallback(async () => {
        try {
            setRecordsError(null);
            const res = await fetchMyRecords(userId);
            console.log("📦 records from backend:", res);
            setRecords(res);
        } catch (e) {
            console.log("❌ records api error:", e);
            setRecordsError("기록을 불러오지 못했어요. 네트워크/서버 상태를 확인해주세요.");
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
            setStatsError("통계를 불러오지 못했어요. 네트워크/서버 상태를 확인해줘.");
            setStats(null);
        }
    }, [userId]);

    // ✅ 최초 진입 시: 둘 다 한 번 로드해두면 탭 전환이 바로바로 됨
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

    // ✅ 상단 탭 전환(네비게이션 X)
    const handleChangeTopTab = (v: "left" | "right") => {
        setActiveTab(v === "left" ? "record" : "stats");
    };

    const segmentedValue: "left" | "right" = activeTab === "record" ? "left" : "right";

    // ✅ 탭별 로딩 처리
    const currentLoading = activeTab === "record" ? recordsLoading : statsLoading;

    if (currentLoading) {
        return (
            <View style={s.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={s.container}>
            {/* 타이틀은 탭에 따라 변경 */}
            <Text style={s.title}>{activeTab === "record" ? "기록" : "통계"}</Text>
            <Text style={s.subTitle}>
                {activeTab === "record" ? "나의 러닝 기록" : "나의 러닝 통계"}
            </Text>

            <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Segmented
                    leftLabel="기록"
                    rightLabel="통계"
                    value={segmentedValue}
                    onChange={handleChangeTopTab}
                />
            </View>

            {/* =========================
          ✅ 기록 탭 UI
         ========================= */}
            {activeTab === "record" && (
                <>
                    {recordsError && (
                        <View style={{ paddingVertical: 10 }}>
                            <Text style={{ color: "#EF4444", fontWeight: "700" }}>{recordsError}</Text>
                        </View>
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
                                <Text style={{ textAlign: "center", color: "#6B7280" }}>
                                    아직 러닝 기록이 없어요.
                                </Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 24 }}
                    />
                </>
            )}

            {/* =========================
          ✅ 통계 탭 UI
         ========================= */}
            {activeTab === "stats" && (
                <>
                    {statsError && (
                        <View style={{ paddingVertical: 10 }}>
                            <Text style={{ color: "#EF4444", fontWeight: "700" }}>{statsError}</Text>
                        </View>
                    )}

                    <ScrollView
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
                    >
                        {stats && (
                            <>
                                <SummaryCards monthly={stats.monthly} />
                                <WeeklyChart weekly={stats.weekly} />
                                <PersonalBestList pb={stats.personalBests} />
                            </>
                        )}

                        <View style={{ height: 24 }} />
                    </ScrollView>
                </>
            )}
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
