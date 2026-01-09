import React, {useMemo} from 'react';
import { View, Text, FlatList, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 컴포넌트 및 훅 import
import CourseCard, { CourseType } from '@/components/CourseCard';
import FilterChip from '@/components/FilterChip';
import { useCourseScreen, FilterType } from './useCourseScreen';
import { getStyles } from './CourseScreen.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// 상단 필터 버튼 데이터
const FILTERS: { label: string; type: FilterType }[] = [
    { label: "5km 미만", type: 'UNDER_5K' },
    { label: "5km 이상", type: 'OVER_5K' },
    { label: "❤ 저장", type: 'SAVED' },
];

export default function CourseScreen() {
    const { activeFilter, courses, loading, handlers } = useCourseScreen();

    const colorScheme = useColorScheme() ?? "light";

    const styles = useMemo(() => {
        return getStyles(colorScheme);
    }, [colorScheme]);

    const colors = Colors[colorScheme];

    const renderItem = ({ item }: { item: CourseType }) => (
        <CourseCard
            course={item}
            onToggle={() => handlers.handleToggleHeart(item.id)}
            onPress={() => handlers.handlePressCard(item)}
            scheme={colorScheme}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* 1. 상단 헤더 영역 */}
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.mainHeader}>코스 추천</Text>
                </View>
            </View>

            {/* 2. 필터 칩 (왼쪽 여백 수정됨) */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={FILTERS}
                    keyExtractor={(item) => item.type}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <FilterChip
                            label={item.label}
                            isActive={activeFilter === item.type}
                            onPress={() => handlers.handleFilterChange(item.type)}
                            scheme={colorScheme}
                        />
                    )}
                    // 🔥 [수정] 아래 숫자를 4에서 24로 변경하여 코스 카드와 줄을 맞춤
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                />
            </View>

            {/* 3. 메인 콘텐츠 영역 */}
            {loading && courses.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 10, color: colors.icon, fontSize: 14 }}>
                        내 주변 코스를 찾고 있어요... 🏃‍♂️
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}

                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>
                                {activeFilter === 'SAVED'
                                    ? "아직 저장한 코스가 없습니다."
                                    : "내 주변 10km 이내에\n해당 조건의 코스가 없습니다."}
                            </Text>
                        </View>
                    }

                    refreshing={loading}
                    onRefresh={() => handlers.handleFilterChange(activeFilter)}
                />
            )}
        </SafeAreaView>
    );
}