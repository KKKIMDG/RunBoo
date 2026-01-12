import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location'; // ✅ 위치 서비스 추가
import { Alert } from 'react-native';

import { CourseService } from '@/services/course/CourseService';
import { CourseType } from '@/components/CourseCard';

export type FilterType = 'UNDER_5K' | 'OVER_5K' | 'SAVED';

export const useCourseScreen = () => {
    const navigation = useNavigation<any>();
    const [courses, setCourses] = useState<CourseType[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('UNDER_5K');
    const [loading, setLoading] = useState(false);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            // 1. 찜한 목록은 '하트 표시'를 위해 언제나 필요하므로 먼저 가져옵니다.
            // (혹은 병렬 처리를 위해 Promise.all을 써도 되지만, 로직 명확성을 위해 순차 처리)
            let savedCourseIds = new Set<number>();
            let savedCoursesData: CourseType[] = [];

            try {
                const response = await CourseService.getSavedCourses();
                savedCoursesData = Array.isArray(response) ? response : [];
                savedCourseIds = new Set(savedCoursesData.map((c) => c.id));
            } catch (e) {
                console.log('찜 목록 로드 실패 (로그인 안 된 상태일 수 있음)');
            }

            // 2. 탭(Filter)에 따라 분기 처리

            // [CASE A] '찜한 코스' 탭인 경우
            if (activeFilter === 'SAVED') {
                const savedCoursesWithFlag = savedCoursesData.map((course) => ({
                    ...course,
                    isSaved: true,
                }));
                setCourses(savedCoursesWithFlag);
            }

            // [CASE B] '5km 미만' / '5km 이상' 탭인 경우 (위치 기반 조회)
            else {
                // (1) 현재 위치 가져오기
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                // (2) 백엔드 파라미터로 변환 ('UNDER_5K' -> 'SHORT', 'OVER_5K' -> 'LONG')
                const typeParam = activeFilter === 'UNDER_5K' ? 'SHORT' : 'LONG';

                // (3) 위치 기반 API 호출 (토큰 없이 호출됨)
                const locationResponse = await CourseService.getCoursesByLocation(
                    latitude,
                    longitude,
                    typeParam
                );

                const locationCourses = Array.isArray(locationResponse) ? locationResponse : [];

                // (5) 찜 상태(isSaved) 병합하기
                const mergedCourses = locationCourses.map((course) => ({
                    ...course,
                    isSaved: savedCourseIds.has(course.id),
                }));

                setCourses(mergedCourses);
            }

        } catch (error) {
            console.error('코스 목록 로딩 실패:', error);
            // 에러 발생 시 목록 비우기보다 기존 데이터를 유지하거나 빈 배열 처리
            // setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [activeFilter]);

    // 화면이 포커스될 때마다 데이터 갱신 (탭 이동 후 돌아왔을 때 등)
    useFocusEffect(
        useCallback(() => {
            fetchCourses();
        }, [fetchCourses])
    );

    const handlers = {
        handleFilterChange: (filter: FilterType) => {
            if (activeFilter !== filter) {
                setCourses([]); // 탭 전환 시 깜빡임 방지용 초기화
                setActiveFilter(filter);
            }
        },
        handlePressCard: (course: CourseType) => {
            // 상세 페이지로 이동 (파라미터 전달 방식은 Navigation 구조에 맞게 수정)
            navigation.navigate('CourseDetail', { courseId: course.id, course });
        },
        handleToggleHeart: async (courseId: number) => {
            // 1. UI 낙관적 업데이트 (즉시 반영)
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === courseId ? { ...c, isSaved: !c.isSaved } : c
                )
            );

            try {
                // 2. 서버 요청 (찜 토글)
                await CourseService.toggleCourseScrap(courseId);

                // 'SAVED' 탭일 때 찜 해제하면 목록에서 제거
                if (activeFilter === 'SAVED') {
                    setCourses((prev) => prev.filter((c) => c.id !== courseId || c.isSaved));
                }
            } catch (error) {
                console.error('찜하기 실패:', error);
                // 3. 실패 시 롤백
                setCourses((prev) =>
                    prev.map((c) =>
                        c.id === courseId ? { ...c, isSaved: !c.isSaved } : c
                    )
                );
            }
        },
    };

    return { activeFilter, courses, loading, handlers };
};