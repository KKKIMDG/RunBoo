//frontend/src/screens/records/RecordsScreen.tsx

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
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
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

type TopTab = "record" | "stats";
type Mode = "NORMAL" | "GHOST" | "TIER";

const PAGE_SIZE = 5;

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

    // ✅ 전체 기록(서버에서 한 번에 받음)
    const [recordsLoading, setRecordsLoading] = useState(true);
    const [allRecords, setAllRecords] = useState<RecordDto[]>([]);
    const [recordsError, setRecordsError] = useState<string | null>(null);

    // ✅ 화면에 보여줄 개수(5개씩 증가)
    const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
    const [moreLoading, setMoreLoading] = useState(false);
    const moreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ✅ “현재 화면에 보이는 카드”만 route API 호출하도록 제어
    const [viewableIdSet, setViewableIdSet] = useState<Set<number>>(new Set());
    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 55 }).current;

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: Array<{ item: RecordDto }> }) => {
            const s = new Set<number>();
            for (const v of viewableItems) {
                const idNum = Number(v.item?.id);
                if (!Number.isNaN(idNum)) s.add(idNum);
            }
            setViewableIdSet(s);
        }
    ).current;

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
            setAllRecords(res);
        } catch (e) {
            console.log("❌ records api error:", e);
            setRecordsError("기록을 불러오지 못했어요.");
            setAllRecords([]);
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

        return () => {
            if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
        };
    }, [loadRecords, loadStats]);

    const handleChangeTopTab = (v: "left" | "right") => {
        setActiveTab(v === "left" ? "record" : "stats");
    };

    const segmentedValue: "left" | "right" = activeTab === "record" ? "left" : "right";
    const currentLoading = activeTab === "record" ? recordsLoading : statsLoading;

    const isDateFilterActive = !!fromDate && !!toDate;
    const isModeFilterActive = !!mode;
    const anyFilterOn = isDateFilterActive || isModeFilterActive;

    // ✅ 정렬 + 필터 적용된 전체 결과
    const filteredAllRecords = useMemo(() => {
        const sorted = [...allRecords].sort(
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
    }, [allRecords, isDateFilterActive, isModeFilterActive, fromDate, toDate, mode]);

    // ✅ 필터/데이터가 바뀌면 다시 5개부터
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
        setMoreLoading(false);
        if (moreTimerRef.current) {
            clearTimeout(moreTimerRef.current);
            moreTimerRef.current = null;
        }
    }, [isDateFilterActive, isModeFilterActive, fromDate, toDate, mode, allRecords.length]);

    const visibleRecords = useMemo(() => {
        return filteredAllRecords.slice(0, visibleCount);
    }, [filteredAllRecords, visibleCount]);

    const loadMore = useCallback(() => {
        if (moreLoading) return;
        if (visibleCount >= filteredAllRecords.length) return;

        setMoreLoading(true);

        if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
        moreTimerRef.current = setTimeout(() => {
            setVisibleCount((prev) => {
                const next = prev + PAGE_SIZE;
                return next > filteredAllRecords.length ? filteredAllRecords.length : next;
            });
            setMoreLoading(false);
        }, 250);
    }, [moreLoading, visibleCount, filteredAllRecords.length]);

    const renderRecordItem = useCallback(
        ({ item }: { item: RecordDto }) => {
            const idNum = Number(item.id);
            const routeEnabled = viewableIdSet.has(idNum); // ✅ 화면에 보일 때만 상세 로딩
            return <RecordCard item={item} routeEnabled={routeEnabled} />;
        },
        [viewableIdSet]
    );

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

                        <ModeFilter mode={mode} onChangeMode={setMode} onReset={() => setMode(null)} />

                        {recordsError && <Text style={styles.errorText}>{recordsError}</Text>}

                        <FlatList
                            data={visibleRecords}
                            keyExtractor={(it) => String(it.id)}
                            renderItem={renderRecordItem}
                            ListEmptyComponent={
                                <View style={{ paddingTop: 40 }}>
                                    <Text style={styles.emptyText}>
                                        {anyFilterOn ? "조건에 맞는 러닝 기록이 없어요." : "아직 러닝 기록이 없어요."}
                                    </Text>
                                </View>
                            }
                            onEndReachedThreshold={0.6}
                            onEndReached={loadMore}
                            ListFooterComponent={
                                moreLoading ? (
                                    <View style={{ paddingVertical: 14 }}>
                                        <ActivityIndicator />
                                    </View>
                                ) : null
                            }
                            // ✅ viewability
                            viewabilityConfig={viewabilityConfig}
                            onViewableItemsChanged={onViewableItemsChanged}
                            // ✅ FlatList 렌더 최적화
                            initialNumToRender={PAGE_SIZE}
                            maxToRenderPerBatch={PAGE_SIZE}
                            windowSize={7}
                            removeClippedSubviews
                            updateCellsBatchingPeriod={40}
                            contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
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
                            contentContainerStyle={{ paddingBottom: tabBarHeight }}
                        />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
