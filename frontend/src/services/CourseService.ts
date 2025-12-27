import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from "@env";

const BASE_URL = API_BASE_URL

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const CourseService = {
    // 1. 목록 조회
    getCourses: async (condition: string) => {
        try {
            const headers = await getHeaders();
            let url = `${API_BASE_URL}/api/courses?category=${condition}`;

            // ★ [400 에러 해결]
            // 찜한 목록은 '/courses'가 아니라 DB 테이블(user_saved_course)을 조회하는 별도 URL이어야 함.
            if (condition === 'SAVED') {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return []; // 로그인 안 했으면 빈 배열

                // [백엔드 주소 추측]
                // 1순위: /user-courses/{userId} (RESTful 표준)
                // 2순위: /user-courses?userId={userId}
                url = `${API_BASE_URL}/api/user-courses/${userId}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (!response.ok) {
                // 400 에러가 계속 나면 URL이 틀린 겁니다. 백엔드 Controller를 확인해야 합니다.
                console.log(`URL 확인 필요: ${url}`);
                throw new Error(`서버 상태: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('🚨 목록 조회 에러:', error);
            return [];
        }
    },

    // 2. 상세 조회 (기존 유지)
    getCourseDetail: async (id: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
                method: 'GET',
                headers: headers
            });
            if (!response.ok) throw new Error(`상세 조회 실패: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('🚨 상세 조회 에러:', error);
            return null;
        }
    },

    // 3. 찜하기 토글 (userId 필수!)
    toggleCourse: async (courseId: number) => {
        try {
            const headers = await getHeaders();

            // ★ [500 에러 해결] 저장해둔 ID 꺼내기
            const userIdStr = await AsyncStorage.getItem('userId');
            const userId = userIdStr ? Number(userIdStr) : null;

            if (!userId) {
                console.error("로그인 정보 없음 (userId is null)");
                throw new Error("로그인이 필요합니다.");
            }

            console.log(`찜하기 요청: User ${userId} -> Course ${courseId}`);

            const response = await fetch(`${API_BASE_URL}/api/user-courses/toggle`, {
                method: 'POST',
                headers: headers,
                // ★ DB 테이블에 userId와 courseId를 넣으려면 둘 다 보내주는 게 가장 확실합니다.
                body: JSON.stringify({
                    userId: userId,
                    courseId: courseId
                }),
            });

            if (!response.ok) throw new Error(`찜하기 실패: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('🚨 찜하기 요청 실패:', error);
            throw error;
        }
    }
};