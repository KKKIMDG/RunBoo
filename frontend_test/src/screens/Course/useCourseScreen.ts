
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
            const data = await CourseService.getCourses({ filter: activeFilter });
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

    const handleToggleHeart = (courseId: number) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === courseId ? { ...course, isSaved: !course.isSaved } : course
            )
        );
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

