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
import AsyncStorage from "@react-native-async-storage/async-storage";

import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";

import SummaryCards from "../stats/components/SummaryCards";
import WeeklyChart from "../stats/components/WeeklyChart";
import PersonalBestList from "../stats/components/PersonalBestList";

import { fetchMyRecords, fetchDashboardStats } from "@/services/record/records";
import type { RecordDto, DashboardStatsDto } from "@/types/record";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type TopTab = "record" | "stats";
type Scheme = "light" | "dark";

// ✅ 어떤 값이 와도 light/dark로 정규화
const normalizeScheme = (s: any): Scheme => (s === "dark" ? "dark" : "light");

const BOTTOM_SPACE = 96;

export default function RecordsScreen() {
    const scheme = normalizeScheme(useColorScheme());
    const colors = Colors[scheme];

    const [activeTab, setActiveTab] = useState<TopTab>("record");
    const [userId, setUserId] = useState<number | null>(null);

    // 기록
    const [recordsLoading, setRecordsLoading] = useState(true);
    const [recordsRefreshing, setRecordsRefreshing] = useState(false);
    const [records, setRecords] = useState<RecordDto[]>([]);
    const [recordsError, setRecordsError] = useState<string | null>(null);

    // 통계
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsRefreshing, setStatsRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    // ✅ userId 로드
    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem("userId");
            const parsed = raw ? Number(raw) : null;
            setUserId(Number.isFinite(parsed) ? parsed : null);
        })();
    }, []);

    const loadRecords = useCallback(async () => {
        if (userId == null) return;
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
        if (userId == null) return;
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

    // 최초 로드
    useEffect(() => {
        if (userId == null) return;
        (async () => {
            try {
                await Promise.all([loadRecords(), loadStats()]);
            } finally {
                setRecordsLoading(false);
                setStatsLoading(false);
            }
        })();
    }, [userId, loadRecords, loadStats]);

    const handleChangeTopTab = (v: "left" | "right") => {
        setActiveTab(v === "left" ? "record" : "stats");
    };

    const segmentedValue: "left" | "right" =
        activeTab === "record" ? "left" : "right";

    if (userId == null) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={colors.tint} />
            </View>
        );
    }

    const currentLoading =
        activeTab === "record" ? recordsLoading : statsLoading;

    if (currentLoading) {
        return (
            <View style={s.center}>
                <ActivityIndicator color={colors.tint} />
            </View>
        );
    }

    return (
        <View style={[s.container, { backgroundColor: colors.background }]}>
            <Text style={[s.title, { color: colors.text }]}>
                {activeTab === "record" ? "기록" : "통계"}
            </Text>
            <Text style={[s.subTitle, { color: colors.icon }]}>
                {activeTab === "record" ? "나의 러닝 기록" : "나의 러닝 통계"}
            </Text>

            <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Segmented
                    leftLabel="기록"
                    rightLabel="통계"
                    value={segmentedValue}
                    onChange={handleChangeTopTab}
                    scheme={scheme}   // ✅ 있어도 되고 없어도 됨
                />
            </View>

            {activeTab === "record" && (
                <>
                    {recordsError && (
                        <Text style={{ color: "#EF4444", fontWeight: "700" }}>
                            {recordsError}
                        </Text>
                    )}

                    <FlatList
                        data={records}
                        keyExtractor={(it) => String(it.id)}
                        renderItem={({ item }) => (
                            <RecordCard item={item} scheme={scheme} />
                        )}
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
                        contentContainerStyle={{ paddingBottom: BOTTOM_SPACE }}
                    />
                </>
            )}

            {activeTab === "stats" && (
                <>
                    {statsError && (
                        <Text style={{ color: "#EF4444", fontWeight: "700" }}>
                            {statsError}
                        </Text>
                    )}

                    <ScrollView
                        contentContainerStyle={{ paddingBottom: BOTTOM_SPACE }}
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
                                <WeeklyChart weekly={stats.weekly} scheme={scheme} />
                                <PersonalBestList pb={stats.personalBests} scheme={scheme} />
                            </>
                        )}
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
    },
    title: { fontSize: 22, fontWeight: "900" },
    subTitle: { marginTop: 4, fontWeight: "600" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
