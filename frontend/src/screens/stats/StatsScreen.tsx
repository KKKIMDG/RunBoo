import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native";
import Segmented from "../records/components/Segmented";
import { fetchDashboardStats } from "../../api/records";
import { DEFAULT_USER_ID } from "../../constants/env";
import type { DashboardStatsDto } from "../../types/record";
import SummaryCards from "./components/SummaryCards";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";

export default function StatsScreen({ navigation }: any) {
    const [tab, setTab] = useState<"left" | "right">("right");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const userId = DEFAULT_USER_ID;

    async function load() {
        try {
            setErrorMsg(null);
            const res = await fetchDashboardStats(userId);
            setStats(res);
        } catch (e) {
            setErrorMsg("통계를 불러오지 못했어요. 네트워크/서버 상태를 확인해줘.");
            setStats(null);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                await load();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleChangeTab = (v: "left" | "right") => {
        if (v === "left") {
            navigation.navigate("Records");
            setTab("right"); // 통계 화면 돌아왔을 때 기본 탭은 '통계'
            return;
        }
        setTab(v);
    };

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

            <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Segmented
                    leftLabel="기록"
                    rightLabel="통계"
                    value={tab}
                    onChange={handleChangeTab}
                />
            </View>

            {errorMsg && (
                <View style={{ paddingVertical: 10 }}>
                    <Text style={{ color: "#EF4444", fontWeight: "700" }}>{errorMsg}</Text>
                </View>
            )}

            <ScrollView
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

                <View style={{ height: 24 }} />
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
