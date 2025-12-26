import React from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import Segmented from "@/screens/records/components/Segmented";
import SummaryCards from "./components/SummaryCards";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";
import { useStatsScreen } from "./useStatsScreen";
import { getStyles } from "./StatsScreen.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type Scheme = "light" | "dark";
const normalize = (s: any): Scheme => (s === "dark" ? "dark" : "light");

export default function StatsScreen() {
    const { tab, loading, refreshing, stats, errorMsg, handlers } = useStatsScreen();
    const scheme = normalize(useColorScheme());
    const styles = getStyles(scheme);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors[scheme].tint} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>통계</Text>
            <Text style={styles.subTitle}>나의 러닝 통계</Text>

            <View style={styles.segmentedContainer}>
                <Segmented
                    leftLabel="기록"
                    rightLabel="통계"
                    value={tab}
                    onChange={handlers.handleChangeTab}
                    scheme={scheme} // ✅ 이제 optional이라 없어도 되지만, 있으면 테마 반영
                />
            </View>

            {errorMsg ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            ) : null}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handlers.onRefresh} />}
            >
                {stats ? (
                    <>
                        <SummaryCards monthly={stats.monthly} />
                        <WeeklyChart weekly={stats.weekly} scheme={scheme} />
                        <PersonalBestList pb={stats.personalBests} scheme={scheme} />
                    </>
                ) : null}
            </ScrollView>
        </View>
    );
}
