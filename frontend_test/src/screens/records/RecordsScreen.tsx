import React from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";
import { useRecordsScreen } from "./useRecordsScreen";
import { getStyles } from "./RecordsScreen.styles"; // getStyles 함수 임포트
import { useColorScheme } from "@/hooks/use-color-scheme"; // useColorScheme 훅 임포트
import BackButton from "@/components/ui/BackButton";
import { Colors } from "@/constants/theme";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useNavigation } from "@react-navigation/native";

export default function RecordsScreen() {
    const { tab, loading, refreshing, data, errorMsg, handlers } = useRecordsScreen();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme); // 현재 테마에 맞는 스타일 생성
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
            <Text style={styles.title}>기록</Text>
            <Text style={styles.subTitle}>나의 러닝 기록</Text>
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
            <BottomNavBar activeTab="통계" onTabPress={handleTabPress} />
        </View>
    );
}
