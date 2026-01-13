//frontend/src/screens/stats/StatsScreen.tsx

import React, {useEffect, useState, useCallback, useMemo} from "react";
import {
    View,
    Text,
    ActivityIndicator,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { fetchDashboardStats } from "@/services/record/recordsService";
import type { DashboardStatsDto } from "@/types/record";

import MonthlyChart from "./components/MonthlyChart";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";

import { getStyles } from "./StatsScreen.style";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

export default function StatsScreen() {

    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const tabBarHeight = useBottomTabBarHeight();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setErrorMsg(null);
            const res = await fetchDashboardStats();
            setStats(res);
        } catch (e) {
            console.log("❌ stats api error:", e);
            setErrorMsg("통계를 불러오지 못했어요.");
            setStats(null);
        }
    }, []);

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
            <View style={styles.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>통계</Text>
                <Text style={styles.subTitle}>나의 러닝 통계</Text>

                {errorMsg && (
                    <Text style={styles.errorText}>{errorMsg}</Text>
                )}

                <FlatList
                    data={[]}
                    renderItem={null}
                    ListHeaderComponent={
                        stats && (
                            <>
                                <MonthlyChart monthly={stats.monthly} />
                                <WeeklyChart weekly={stats.weekly} />
                                <PersonalBestList pb={stats.personalBests} />
                            </>
                        )
                    }
                    contentContainerStyle={{
                        paddingBottom: tabBarHeight,
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
