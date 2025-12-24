import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';

import CourseCard, { CourseType } from '../../components/CourseCard';
import FilterChip from '../../components/FilterChip';
import { CourseService } from '../../services/CourseService';

export default function CourseScreen({ navigation, onLogout }: any) {
    const [activeFilter, setActiveFilter] = useState<'UNDER_5K' | 'OVER_5K' | 'SAVED'>('UNDER_5K');
    const [courses, setCourses] = useState<CourseType[]>([]);

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    const fetchData = async () => {
        if (activeFilter === 'SAVED') {
            setCourses([]);
            return;
        }

        const condition = activeFilter === 'UNDER_5K' ? 'UNDER_5K' : 'OVER_5K';
        const data = await CourseService.getCourses(condition);
        console.log("서버에서 받은 원본 데이터 첫번째꺼:", data[0]);

        // ★ [핵심] 서버에서 온 data를 앱에서 쓸 형식으로 바꿉니다.
        const mappedData: CourseType[] = data.map((item: any) => ({
            id: item.id,
            title: item.name,
            address: item.address,
            distance: `${item.lengthKm} km`,
            // ⬇️ 포스트맨에서 확인한 그 'imageUrl' 주소를 여기에 넣어줘야 지도가 뜹니다!
            imageUrl: item.imageUrl,
            isSaved: false,
        }));

        setCourses(mappedData);
    };

    const handlePressCard = (courseId: number) => {
        navigation.navigate('CourseDetail', { courseId: courseId });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={styles.subHeader}>HOT PLACES</Text>
                    <Text style={styles.mainHeader}>코스 추천</Text>
                </View>

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="5km 미만" isActive={activeFilter === 'UNDER_5K'} onPress={() => setActiveFilter('UNDER_5K')} />
                        <FilterChip label="5km 이상" isActive={activeFilter === 'OVER_5K'} onPress={() => setActiveFilter('OVER_5K')} />
                        <FilterChip label="❤ 저장" isActive={activeFilter === 'SAVED'} onPress={() => setActiveFilter('SAVED')} />
                    </ScrollView>
                </View>

                <View style={styles.courseList}>
                    {courses.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            onPress={() => handlePressCard(course.id)}
                            activeOpacity={0.8}
                        >
                            <CourseCard course={course} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={{fontWeight: 'bold', color: '#3A4A98'}}>홈</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={onLogout}>
                    <Text style={{color: '#888'}}>로그아웃</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingBottom: 100 },
    header: { paddingHorizontal: 24, marginTop: 20, marginBottom: 20 },
    subHeader: { fontSize: 12, color: '#868E96', fontWeight: '600', marginBottom: 4 },
    mainHeader: { fontSize: 28, fontWeight: 'bold', color: '#000' },
    filterContainer: { paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row' },
    courseList: { paddingHorizontal: 24 },
    bottomNav: {
        position: 'absolute', bottom: 0, width: '100%', height: 70,
        backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee'
    },
    tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});