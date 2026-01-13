import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

import { CourseService, CourseSortType } from '@/services/course/CourseService';
import { Course } from '@/types/course';

// ✅ 필터 타입 정의 ('MY' 추가됨)
export type FilterType = CourseSortType | 'SAVED' | 'MY';

export const useCourseScreen = () => {
    const navigation = useNavigation<any>();

    const [courses, setCourses] = useState<Course[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('POPULAR');
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // 🔄 데이터 불러오기
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            // 1. 찜 목록 먼저 가져오기 (하트 표시용)
            let savedCourseIds = new Set<number>();
            try {
                const savedRes = await CourseService.getSavedCourses();
                const savedList = Array.isArray(savedRes) ? savedRes : [];
                savedCourseIds = new Set(savedList.map((c: any) => c.id));
            } catch (e) {} // 비로그인 무시

            let resultData: Course[] = [];

            // 2. 탭에 따른 분기 처리
            if (activeFilter === 'SAVED') {
                // [찜한 코스]
                const savedRes = await CourseService.getSavedCourses();
                resultData = Array.isArray(savedRes) ? savedRes : [];
            }
            else if (activeFilter === 'MY') {
                // [내 코스] (새로 추가됨) ✅
                resultData = await CourseService.getMyCourses();
            }
            else {
                // [인기/최신/내주변]
                let lat = location?.latitude;
                let lon = location?.longitude;

                if (activeFilter === 'NEARBY' && !lat) {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
                        setActiveFilter('POPULAR');
                        setLoading(false);
                        return;
                    }
                    const loc = await Location.getCurrentPositionAsync({});
                    lat = loc.coords.latitude;
                    lon = loc.coords.longitude;
                    setLocation({ latitude: lat, longitude: lon });
                }

                resultData = await CourseService.getCourses(
                    activeFilter as CourseSortType,
                    lat,
                    lon
                );
            }

            // 3. 데이터 병합 (isSaved 플래그 처리)
            // 'SAVED' 탭이 아니더라도, 내가 찜한건지 표시해줌
            const mergedCourses = resultData.map((course) => ({
                ...course,
                isSaved: activeFilter === 'SAVED' ? true : savedCourseIds.has(course.id),
            }));

            setCourses(mergedCourses);

        } catch (error) {
            console.error('목록 로딩 실패:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, location]);

    useFocusEffect(
        useCallback(() => {
            fetchCourses();
        }, [fetchCourses])
    );

    const handlers = {
        handleFilterChange: (filter: FilterType) => {
            if (activeFilter !== filter) {
                setCourses([]);
                setActiveFilter(filter);
            }
        },
        handlePressCard: (course: Course) => {
            navigation.navigate('CourseDetail', { course });
        },

        // ❤️ 찜하기 토글
        handleToggleHeart: async (courseId: number) => {
            // UI 낙관적 업데이트
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === courseId
                        ? { ...c, isSaved: !c.isSaved, saveCount: c.isSaved ? c.saveCount - 1 : c.saveCount + 1 }
                        : c
                )
            );

            try {
                await CourseService.toggleCourseSave(courseId);
                // 찜한 코스 탭에서 취소하면 목록에서 제거
                if (activeFilter === 'SAVED') {
                    setCourses((prev) => prev.filter((c) => c.isSaved));
                }
            } catch (error) {
                Alert.alert("알림", "로그인이 필요하거나 오류가 발생했습니다.");
                fetchCourses(); // 롤백
            }
        },

        // 🗑️ [추가] 코스 삭제 핸들러
        handleDeleteCourse: (courseId: number) => {
            Alert.alert(
                "코스 삭제",
                "정말로 삭제하시겠습니까?\n삭제된 코스는 복구할 수 없습니다.",
                [
                    { text: "취소", style: "cancel" },
                    {
                        text: "삭제",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await CourseService.deleteCourse(courseId);
                                Alert.alert("삭제 완료", "코스가 삭제되었습니다.");
                                // 목록에서 즉시 제거
                                setCourses((prev) => prev.filter((c) => c.id !== courseId));
                            } catch (e) {
                                Alert.alert("오류", "삭제에 실패했습니다.");
                            }
                        }
                    }
                ]
            );
        }
    };

    return { activeFilter, courses, loading, handlers };
};