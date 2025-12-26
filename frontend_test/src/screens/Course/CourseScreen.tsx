import React from 'react';
import { View, Text, FlatList, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 🔥 [핵심] 여기서도 '정품 설명서' CourseType을 가져와야 합니다.
import CourseCard, { CourseType } from '@/components/CourseCard';
import FilterChip from '@/components/FilterChip';
import { useCourseScreen, FilterType } from './useCourseScreen';
import { getStyles } from './CourseScreen.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import BackButton from '@/components/ui/BackButton';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { useNavigation } from '@react-navigation/native';

const FILTERS: { label: string; type: FilterType }[] = [
    { label: "5km 미만", type: 'UNDER_5K' },
    { label: "5km 이상", type: 'OVER_5K' },
    { label: "❤ 저장", type: 'SAVED' },
];

// 🔥 [Render Error 해결] export default function 필수!
export default function CourseScreen() {
    const { activeFilter, courses, handlers } = useCourseScreen();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];
    const navigation = useNavigation<any>();

    const handleTabPress = (tabName: string) => {
        if (tabName === '홈') navigation.navigate('Home');
        if (tabName === '코스') navigation.navigate('Course');
        if (tabName === '통계') navigation.navigate('Records');
    };

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
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={styles.header}>
                <BackButton />
                <View style={styles.headerText}>
                    <Text style={styles.subHeader}>HOT PLACES</Text>
                    <Text style={styles.mainHeader}>코스 추천</Text>
                </View>
            </View>

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
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                />
            </View>

            <FlatList
                data={courses}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyListContainer}>
                        <Text style={styles.emptyListText}>
                            {activeFilter === 'SAVED' ? "아직 저장한 코스가 없습니다." : "코스 데이터가 없습니다."}
                        </Text>
                    </View>
                }
            />
            <BottomNavBar activeTab="코스" onTabPress={handleTabPress} />
        </SafeAreaView>
    );
}