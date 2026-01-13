import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// ✅ 1. 변수와 헬퍼 함수 정의
const BASE_URL = API_BASE_URL;

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ✅ 2. 정렬 타입 정의 (프론트에서 자동완성 되도록 export)
export type CourseSortType = 'POPULAR' | 'LATEST' | 'NEARBY';

export const CourseService = {

    /**
     * ✅ 1. 코스 목록 조회 (통합됨)
     * - sort: 'POPULAR'(인기순), 'LATEST'(최신순), 'NEARBY'(거리순)
     * - latitude, longitude: 'NEARBY'일 때 필수, 나머지는 선택
     */
    getCourses: async (
        sort: CourseSortType = 'POPULAR',
        latitude?: number,
        longitude?: number
    ) => {
        try {
            // 토큰이 있으면 넣고, 없으면 뺍니다 (비로그인 유저도 조회 가능하게)
            const token = await AsyncStorage.getItem('accessToken');
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // URL 파라미터 구성
            const params = new URLSearchParams();
            params.append('sort', sort);

            // 거리순 정렬이거나, 좌표가 있으면 보냄
            if (latitude && longitude) {
                params.append('latitude', latitude.toString());
                params.append('longitude', longitude.toString());
            }

            const url = `${BASE_URL}/api/courses/list?${params.toString()}`;
            console.log("🚀 코스 목록 요청:", url);

            const response = await fetch(url, { method: 'GET', headers });

            if (!response.ok) {
                throw new Error(`코스 조회 실패(${response.status})`);
            }

            return await response.json();
        } catch (error) {
            console.error('🚨 코스 목록 조회 에러:', error);
            return []; // 에러 시 빈 배열 반환
        }
    },

    /**
     * ✅ 2. 코스 상세 조회
     */
    getCourseDetail: async (id: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/courses/${id}`, { method: 'GET', headers });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('🚨 코스 상세 조회 에러:', error);
            return null;
        }
    },

    /**
     * ✅ 3. [신규] 내 기록으로 코스 만들기 (업로드)
     */
    createCourseFromRecord: async (data: {
        recordId: number;
        name: string;
        description: string;
        address: string;
        latitude: number;   // 👈 추가
        longitude: number;  // 👈 추가
    }) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/courses/from-record`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '코스 등록 실패');
            }

            // 성공 시 리턴값 (필요하면 백엔드 응답에 따라 수정)
            return true;
        } catch (error) {
            console.error('🚨 코스 등록 에러:', error);
            throw error;
        }
    },

    /**
     * ✅ 4. 찜한 목록 조회
     */
    getSavedCourses: async () => {
        try {
            const headers = await getHeaders();
            if (!headers['Authorization']) return []; // 비로그인 시 빈 배열

            const url = `${BASE_URL}/api/user-courses`;
            const response = await fetch(url, { method: 'GET', headers });

            if (response.status === 403 || response.status === 401) return [];
            if (!response.ok) throw new Error(`상태: ${response.status}`);

            return await response.json();
        } catch (error) {
            return [];
        }
    },

    /**
     * ✅ 5. 찜하기 / 찜 취소 토글
     */
    toggleCourseSave: async (courseId: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/user-courses/toggle`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ courseId }),
            });

            if (!response.ok) throw new Error(`찜 실패: ${response.status}`);
            return await response.json(); // { message: "...", isSaved: boolean }
        } catch (error) {
            console.error('🚨 찜 토글 에러:', error);
            throw error;
        }
    },

    getMyCourses: async () => {
        try {
            const headers = await getHeaders();
            if (!headers['Authorization']) return []; // 비로그인 시 빈 배열

            const response = await fetch(`${BASE_URL}/api/courses/my`, { method: 'GET', headers });
            if (!response.ok) return [];

            return await response.json();
        } catch (error) {
            console.error('내 코스 조회 에러:', error);
            return [];
        }
    },

    /**
     * ✅ [추가] 코스 삭제
     */
    deleteCourse: async (courseId: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/courses/${courseId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error('삭제 실패');
            }
            return true;
        } catch (error) {
            console.error('코스 삭제 에러:', error);
            throw error;
        }
    }
};