import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import Segmented from "@/screens/records/components/Segmented";
import SummaryCards from "./components/SummaryCards";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";
import { useStatsScreen } from "./useStatsScreen";
import { getStyles } from "./StatsScreen.styles";
import ScreenLayout from "@/components/layout/ScreenLayout";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function StatsScreen() {
    const { tab, loading, refreshing, stats, errorMsg, handlers } = useStatsScreen();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);

    return (
        <ScreenLayout title="통계" subtitle="나의 러닝 통계" loading={loading}>
            <View style={styles.segmentedContainer}>
                <Segmented
                    leftLabel="기록"
                    rightLabel="통계"
                    value={tab}
                    onChange={handlers.handleChangeTab}
                    scheme={colorScheme}
                />
            </View>

            {errorMsg && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handlers.onRefresh} />
                }
            >
                {stats && (
                    <>
                        <SummaryCards monthly={stats.monthly} scheme={colorScheme} />
                        <WeeklyChart weekly={stats.weekly} scheme={colorScheme} />
                        <PersonalBestList pb={stats.personalBests} scheme={colorScheme} />
                    </>
                )}

                <View style={styles.scrollViewFooter} />
            </ScrollView>
        </ScreenLayout>
    );
}
