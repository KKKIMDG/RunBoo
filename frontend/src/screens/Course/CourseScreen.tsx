import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert
} from 'react-native';
// 안전한 화면 영역 처리를 위한 라이브러리
import { SafeAreaView } from 'react-native-safe-area-context';

import CourseCard, { CourseType } from '../../components/CourseCard';
import FilterChip from '../../components/FilterChip';
import { CourseService } from '../../services/CourseService';

interface CourseScreenProps {
    navigation: any;
}

export default function CourseScreen({ navigation }: CourseScreenProps) {
    const [activeFilter, setActiveFilter] = useState<'UNDER_5K' | 'OVER_5K' | 'SAVED'>('UNDER_5K');
    const [courses, setCourses] = useState<CourseType[]>([]);

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    // ★ 데이터를 불러오고 + 하트 상태를 동기화하는 핵심 함수
    const fetchData = async () => {
        try {
            // 1. 현재 탭(필터)에 맞는 데이터 요청
            const condition = activeFilter;
            const data = await CourseService.getCourses(condition);

            if (!data) return;

            // 2. [하트 비교 로직]
            // 만약 '저장' 탭이 아니라면, 내가 찜한 목록을 몰래 가져와서 비교해야 합니다.
            let mySavedIds: number[] = [];

            if (activeFilter !== 'SAVED') {
                try {
                    // 'SAVED' 조건으로 요청하면 내 찜 목록을 가져옵니다 (로그인 된 경우)
                    const savedData = await CourseService.getCourses('SAVED');
                    if (Array.isArray(savedData)) {
                        mySavedIds = savedData.map((item: any) => item.id);
                    }
                } catch (e) {
                    console.log("찜 목록 비교 실패 (로그인 안 됨 등)");
                }
            }

            // 3. 데이터 가공 (화면에 보여줄 형태로 변환 + 하트 여부 결정)
            const mappedData: CourseType[] = data
                .filter((item: any) => item && item.id)
                .map((item: any) => {
                    // ★ 하트를 채울지 말지 결정하는 조건
                    // A. 현재 '저장' 탭이면 무조건 true
                    // B. 내 찜 목록 ID 리스트(mySavedIds)에 이 코스 ID가 있으면 true
                    const isHeartFilled = (activeFilter === 'SAVED') || mySavedIds.includes(item.id);

                    return {
                        id: item.id,
                        title: item.name || "이름 없음",
                        address: item.address || "주소 정보 없음",
                        distance: item.lengthKm ? `${item.lengthKm} km` : "0 km",
                        imageUrl: item.imageUrl || null,

                        // 결정된 하트 상태 적용
                        isSaved: isHeartFilled,
                    };
                });

            setCourses(mappedData);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        }
    };

    // ★ 하트 토글 함수 (찜하기 / 취소)
    const handleToggleHeart = async (courseId: number) => {
        try {
            // 1. [UX 개선] 서버 응답 기다리지 않고 화면의 하트 먼저 바꾸기 (반응속도 UP)
            setCourses(prevCourses =>
                prevCourses.map(course => {
                    if (course.id === courseId) {
                        return { ...course, isSaved: !course.isSaved };
                    }
                    return course;
                })
            );

            // 2. 실제 서버에 요청 (토글 API)
            // 토큰에 유저 정보가 있으니 userId는 안 보냅니다.
            await CourseService.toggleCourse(courseId);

            // (선택사항) 만약 '찜한 목록(SAVED)' 탭에서 하트를 껐다면, 목록에서 바로 사라지게 할 수도 있습니다.
            // if (activeFilter === 'SAVED') {
            //    setCourses(prev => prev.filter(c => c.id !== courseId));
            // }

        } catch (error) {
            // 실패하면 다시 원래대로 되돌림 (롤백)
            Alert.alert("실패", "요청을 처리하지 못했습니다.");
            setCourses(prevCourses =>
                prevCourses.map(course =>
                    course.id === courseId ? { ...course, isSaved: !course.isSaved } : course
                )
            );
        }
    };

    const handlePressCard = (course: CourseType) => {
        navigation.navigate('CourseDetail', { course: course });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={styles.subHeader}>HOT PLACES</Text>
                    <Text style={styles.mainHeader}>코스 추천</Text>
                </View>

                {/* 필터 영역 */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="5km 미만" isActive={activeFilter === 'UNDER_5K'} onPress={() => setActiveFilter('UNDER_5K')} />
                        <FilterChip label="5km 이상" isActive={activeFilter === 'OVER_5K'} onPress={() => setActiveFilter('OVER_5K')} />
                        <FilterChip label="❤ 저장" isActive={activeFilter === 'SAVED'} onPress={() => setActiveFilter('SAVED')} />
                    </ScrollView>
                </View>

                {/* 코스 리스트 영역 */}
                <View style={styles.courseList}>
                    {courses.map((course) => (
                        <TouchableOpacity
                            key={course.id}
                            onPress={() => handlePressCard(course)}
                            activeOpacity={0.8}
                        >
                            {/* ★ onToggle 함수 전달 */}
                            <CourseCard
                                course={course}
                                onToggle={() => handleToggleHeart(course.id)}
                            />
                        </TouchableOpacity>
                    ))}

                    {/* 목록이 비었을 때 안내 메시지 */}
                    {courses.length === 0 && (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#aaa' }}>
                                {activeFilter === 'SAVED' ? "아직 저장한 코스가 없습니다." : "코스 데이터가 없습니다."}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { paddingBottom: 20 },
    header: { paddingHorizontal: 24, marginTop: 20, marginBottom: 20 },
    subHeader: { fontSize: 12, color: '#868E96', fontWeight: '600', marginBottom: 4 },
    mainHeader: { fontSize: 28, fontWeight: 'bold', color: '#000' },
    filterContainer: { paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row' },
    courseList: { paddingHorizontal: 24 },
});