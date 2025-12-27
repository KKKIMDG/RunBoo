import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CourseService } from '@/services/CourseService'; // 🔥 CourseService 사용
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
            // 1. 일반 코스 목록과 찜한 코스 목록을 병렬로 가져옵니다.
            const [coursesResponse, savedCoursesResponse] = await Promise.all([
                CourseService.getCourses(activeFilter),
                CourseService.getCourses('SAVED') // 찜한 목록 API 호출
            ]);

            const coursesData = Array.isArray(coursesResponse) ? coursesResponse : [];
            const savedCoursesData = Array.isArray(savedCoursesResponse) ? savedCoursesResponse : [];

            // 2. 찜한 코스 ID를 Set으로 만들어 빠른 조회를 지원합니다.
            const savedCourseIds = new Set(savedCoursesData.map(c => c.id));

            // 3. 일반 코스 목록에 isSaved 상태를 업데이트합니다.
            const updatedCourses = coursesData.map(course => ({
                ...course,
                isSaved: savedCourseIds.has(course.id),
            }));

            // 'SAVED' 필터일 경우, 찜한 목록만 보여줍니다.
            if (activeFilter === 'SAVED') {
                // 찜한 목록의 모든 코스에 isSaved를 true로 설정
                const savedCoursesWithFlag = savedCoursesData.map(course => ({
                    ...course,
                    isSaved: true,
                }));
                setCourses(savedCoursesWithFlag);
            } else {
                setCourses(updatedCourses);
            }

        } catch (error) {
            console.error('코스 목록 로딩 실패:', error);
            setCourses([]); // 에러 발생 시 목록을 비웁니다.
        } finally {
            setLoading(false);
        }
    }, [activeFilter]); // activeFilter가 변경될 때마다 함수 재생성

    // 화면이 포커스될 때마다 데이터 로딩
    useFocusEffect(
        useCallback(() => {
            fetchCourses();
        }, [fetchCourses])
    );

    const handlers = {
        handleFilterChange: (filter: FilterType) => {
            setActiveFilter(filter);
        },
        handlePressCard: (course: CourseType) => {
            navigation.navigate('CourseDetail', { course });
        },
        // 찜하기 로직도 CourseService 사용을 권장 (추후 리팩토링)
        handleToggleHeart: async (courseId: number) => {
            // 먼저 화면을 낙관적으로 업데이트
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === courseId ? { ...c, isSaved: !c.isSaved } : c
                )
            );

            try {
                // CourseService를 사용하여 찜하기 API 호출
                await CourseService.toggleCourse(courseId);

                // '저장' 필터가 활성 상태일 때, 찜 해제한 항목을 목록에서 제거
                if (activeFilter === 'SAVED') {
                    setCourses((prev) => prev.filter((c) => c.id !== courseId || c.isSaved));
                }
            } catch (error) {
                console.error('찜하기 실패:', error);
                // 에러 발생 시, 원래 상태로 롤백
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