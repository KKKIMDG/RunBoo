import React from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";
import { useRecordsScreen } from "./useRecordsScreen";
import { getStyles } from "./RecordsScreen.styles"; // getStyles 함수 임포트
import ScreenLayout from "@/components/layout/ScreenLayout";
import { useColorScheme } from "@/hooks/use-color-scheme"; // useColorScheme 훅 임포트

export default function RecordsScreen() {
    const { tab, loading, refreshing, data, errorMsg, handlers } = useRecordsScreen();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme); // 현재 테마에 맞는 스타일 생성

    return (
        <ScreenLayout title="기록" subtitle="나의 러닝 기록" loading={loading}>
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

            <FlatList
                data={data}
                keyExtractor={(it) => String(it.id)}
                renderItem={({ item }) => <RecordCard item={item} scheme={colorScheme} />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handlers.onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>
                            아직 러닝 기록이 없어요.
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContentContainer}
            />
        </ScreenLayout>
    );
}