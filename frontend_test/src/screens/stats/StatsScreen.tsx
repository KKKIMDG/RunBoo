import React from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import Segmented from "@/screens/records/components/Segmented";
import SummaryCards from "./components/SummaryCards";
import WeeklyChart from "./components/WeeklyChart";
import PersonalBestList from "./components/PersonalBestList";
import { useStatsScreen } from "./useStatsScreen";
import { getStyles } from "./StatsScreen.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BackButton from "@/components/ui/BackButton";
import { Colors } from "@/constants/theme";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useNavigation } from "@react-navigation/native";

export default function StatsScreen() {
    const { tab, loading, refreshing, stats, errorMsg, handlers } = useStatsScreen();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);
    const navigation = useNavigation<any>();

    const handleTabPress = (tabName: string) => {
        if (tabName === '홈') navigation.navigate('Home');
        if (tabName === '코스') navigation.navigate('Course');
        if (tabName === '통계') navigation.navigate('Records');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors[colorScheme].tint} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.backButtonContainer}>
                <BackButton />
            </View>
            <Text style={styles.title}>통계</Text>
            <Text style={styles.subTitle}>나의 러닝 통계</Text>
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
            <BottomNavBar activeTab="통계" onTabPress={handleTabPress} />
        </View>
    );
}
