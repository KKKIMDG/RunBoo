//frontend/src/screens/records/RecordsScreen.tsx

import React, {useEffect, useState, useCallback, useMemo} from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";
import DateRangeFilter from "./components/DateRangeFilter";
import ModeFilter from "./components/ModeFilter";

import MonthlyChart from "../stats/components/MonthlyChart";
import WeeklyChart from "../stats/components/WeeklyChart";
import PersonalBestList from "../stats/components/PersonalBestList";

import { fetchMyRecords, fetchDashboardStats } from "@/services/record/recordsService";
import type { RecordDto, DashboardStatsDto } from "@/types/record";

import { getStyles } from "./RecordsScreen.style";
import AiAnalysisCard from "./components/AiAnalysisCard";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

type TopTab = "record" | "stats";
type Mode = "NORMAL" | "GHOST" | "TIER";

function useSafeBottomTabBarHeight() {
    try {
        return useBottomTabBarHeight();
    } catch {
        return 0;
    }
}

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function endOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}

export default function RecordsScreen() {

    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);


    const tabBarHeight = useSafeBottomTabBarHeight();

    const [activeTab, setActiveTab] = useState<TopTab>("record");

    const [recordsLoading, setRecordsLoading] = useState(true);
    const [records, setRecords] = useState<RecordDto[]>([]);
    const [recordsError, setRecordsError] = useState<string | null>(null);

    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    const [mode, setMode] = useState<Mode | null>(null);

    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    const loadRecords = useCallback(async () => {
        try {
            setRecordsError(null);
            const res = await fetchMyRecords();
            setRecords(res);
        } catch (e) {
            console.log("❌ records api error:", e);
            setRecordsError("기록을 불러오지 못했어요.");
            setRecords([]);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            setStatsError(null);
            const res = await fetchDashboardStats();
            setStats(res);
        } catch (e) {
            console.log("❌ stats api error:", e);
            setStatsError("통계를 불러오지 못했어요.");
            setStats(null);
        }
    }, []);

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

    const currentLoading = activeTab === "record" ? recordsLoading : statsLoading;

    const isDateFilterActive = !!fromDate && !!toDate;
    const isModeFilterActive = !!mode;

    const anyFilterOn = isDateFilterActive || isModeFilterActive;

    const filteredRecords = React.useMemo(() => {
        const sorted = [...records].sort(
            (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        if (!isDateFilterActive && !isModeFilterActive) return sorted;

        const from = isDateFilterActive && fromDate ? startOfDay(fromDate).getTime() : null;
        const to = isDateFilterActive && toDate ? endOfDay(toDate).getTime() : null;

        return sorted.filter((r) => {
            if (isDateFilterActive) {
                const t = new Date(r.startedAt).getTime();
                if (from !== null && t < from) return false;
                if (to !== null && t > to) return false;
            }

            if (isModeFilterActive) {
                if (r.mode !== mode) return false;
            }

            return true;
        });
    }, [records, isDateFilterActive, isModeFilterActive, fromDate, toDate, mode]);

    if (currentLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>{activeTab === "record" ? "기록" : "통계"}</Text>
                <Text style={styles.subTitle}>
                    {activeTab === "record" ? "나의 런닝 기록" : "나의 런닝 통계"}
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
                        <DateRangeFilter
                            fromDate={fromDate}
                            toDate={toDate}
                            onChangeFromDate={(d) => setFromDate(d)}
                            onChangeToDate={(d) => setToDate(d)}
                            onReset={() => {
                                setFromDate(null);
                                setToDate(null);
                            }}
                        />

                        <ModeFilter
                            mode={mode}
                            onChangeMode={setMode}
                            onReset={() => setMode(null)}
                        />

                        {recordsError && <Text style={styles.errorText}>{recordsError}</Text>}

                        <FlatList
                            data={filteredRecords}
                            keyExtractor={(it) => String(it.id)}
                            renderItem={({ item }) => <RecordCard item={item} />}
                            ListEmptyComponent={
                                <View style={{ paddingTop: 40 }}>
                                    <Text style={styles.emptyText}>
                                        {anyFilterOn
                                            ? "조건에 맞는 러닝 기록이 없어요."
                                            : "아직 러닝 기록이 없어요."}
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
                        {statsError && <Text style={styles.errorText}>{statsError}</Text>}

                        <FlatList
                            data={[]}
                            renderItem={null}
                            ListHeaderComponent={
                                stats && (
                                    <>
                                        <MonthlyChart monthly={stats.monthly} />
                                        <WeeklyChart weekly={stats.weekly} />
                                        <PersonalBestList pb={stats.personalBests} />
                                        <View style={{ marginTop: 13, marginBottom: 20 }}>
                                            <AiAnalysisCard />
                                        </View>
                                    </>
                                )
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
