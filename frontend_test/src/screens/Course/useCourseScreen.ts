
import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CourseService } from '@/services/CourseService';
import { CourseType } from '@/components/CourseCard';

export type FilterType = 'UNDER_5K' | 'OVER_5K' | 'SAVED';

export const useCourseScreen = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [activeFilter, setActiveFilter] = useState<FilterType>('UNDER_5K');
    const [courses, setCourses] = useState<CourseType[]>([]);

    const fetchCourses = useCallback(async () => {
        try {
            const data = await CourseService.getCourses(activeFilter);
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
    };

    const handleToggleHeart = async (courseId: number) => {
        try {
            const result = await CourseService.toggleCourse(courseId);
            setCourses(prevCourses =>
                prevCourses.flatMap(course => {
                    if (course.id !== courseId) return [course];
                    const nextIsSaved = typeof result?.isSaved === 'boolean' ? result.isSaved : !course.isSaved;
                    const nextCourse = { ...course, isSaved: nextIsSaved };
                    if (activeFilter === 'SAVED' && !nextIsSaved) return [];
                    return [nextCourse];
                })
            );
        } catch (error) {
            console.error('Failed to toggle course:', error);
        }
    };

    const handlePressCard = (course: CourseType) => {
        navigation.navigate('CourseDetail', { course });
    };

    return {
        activeFilter,
        courses,
        handlers: {
            handleFilterChange,
            handleToggleHeart,
            handlePressCard,
        },
    };
};

