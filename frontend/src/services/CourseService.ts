import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const CourseService = {
    /**
     * 코스 목록 조회
     */
    getCourses: async (condition: string) => {
        try {
            const headers = await getHeaders();
            let url = `${BASE_URL}/api/courses?category=${condition}`;

            // ✅ 찜한 코스
            if (condition === 'SAVED') {
                url = `${BASE_URL}/api/user-courses`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`서버 상태: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('🚨 목록 조회 에러:', error);
            return [];
        }
    },

    /**
     * 코스 상세 조회 (변경 없음)
     */
    getCourseDetail: async (id: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/courses/${id}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`상세 조회 실패: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('🚨 상세 조회 에러:', error);
            return null;
        }
    },

    /**
     * 코스 찜 / 해제
     */
    toggleCourse: async (courseId: number) => {
        try {
            const headers = await getHeaders();

            const response = await fetch(`${BASE_URL}/api/user-courses/toggle`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    courseId, // ✅ userId 제거
                }),
            });

            if (!response.ok) {
                throw new Error(`찜하기 실패: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('🚨 찜하기 요청 실패:', error);
            throw error;
        }
    },
};
