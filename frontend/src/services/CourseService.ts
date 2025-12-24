import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api';

export const CourseService = {
    // 1. 목록 조회 (기존)
    getCourses: async (condition: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/courses?category=${condition}`);
            if (!response.ok) throw new Error(`서버 상태: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('🚨 에러 발생:', error);
            return [];
        }
    },

    // 2. [NEW] 코스 상세 조회 (추가된 부분!) ★
    getCourseDetail: async (id: number) => {
        try {
            // 예: /api/courses/1
            const response = await fetch(`${API_BASE_URL}/courses/${id}`);
            if (!response.ok) throw new Error(`상세 조회 실패: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('🚨 상세 조회 에러:', error);
            return null;
        }
    },

    // 3. 찜하기 (기존)
    toggleCourse: async (userId: number, courseId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user-courses/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, courseId }),
            });
            if (!response.ok) throw new Error(`찜하기 실패: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('🚨 찜하기 요청 실패:', error);
            throw error;
        }
    }
};