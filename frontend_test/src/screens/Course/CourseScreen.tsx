
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseCard from '@/components/CourseCard';
import FilterChip from '@/components/FilterChip';
import { useCourseScreen, FilterType } from './useCourseScreen';
import { getStyles } from './CourseScreen.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const FILTERS: { label: string; type: FilterType }[] = [
    { label: "5km 미만", type: 'UNDER_5K' },
    { label: "5km 이상", type: 'OVER_5K' },
    { label: "❤ 저장", type: 'SAVED' },
];

export default function CourseScreen() {
    const { activeFilter, courses, handlers } = useCourseScreen();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.subHeader}>HOT PLACES</Text>
                    <Text style={styles.mainHeader}>코스 추천</Text>
                </View>

                {/* 필터 영역 */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {FILTERS.map(({ label, type }) => (
                            <FilterChip
                                key={type}
                                label={label}
                                isActive={activeFilter === type}
                                onPress={() => handlers.handleFilterChange(type)}
                                scheme={colorScheme}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* 코스 리스트 영역 */}
                <View style={styles.courseList}>
                    {courses.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            onPress={() => handlers.handlePressCard(course)}
                            activeOpacity={0.8}
                        >
                            <CourseCard
                                course={course}
                                onToggle={() => handlers.handleToggleHeart(course.id)}
                                scheme={colorScheme}
                            />
                        </TouchableOpacity>
                    ))}

                    {courses.length === 0 && (
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>
                                {activeFilter === 'SAVED' ? "아직 저장한 코스가 없습니다." : "코스 데이터가 없습니다."}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
