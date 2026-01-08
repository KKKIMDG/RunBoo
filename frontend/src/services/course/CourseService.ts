import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env'; // 👈 .env 파일에서 주소 가져오기

// ✅ [핵심 1] 변수와 헬퍼 함수는 'export const CourseService'보다 위에 있어야 합니다.
const BASE_URL = API_BASE_URL;

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const CourseService = {

    /**
     * ✅ 1. 내 위치 기반 코스 목록 조회 (토큰 없이 요청)
     * 403 에러 방지를 위해 Authorization 헤더를 뺍니다.
     */
    getCoursesByLocation: async (latitude: number, longitude: number, type: string) => {
        try {
            // 토큰 없는 순수 헤더
            const headers = { 'Content-Type': 'application/json' };

            // 쿼리 스트링 조합
            const url = `${BASE_URL}/api/courses/list?latitude=${latitude}&longitude=${longitude}&type=${type}`;

            console.log("🚀 위치 기반 요청 URL:", url);

            const response = await fetch(url, { method: 'GET', headers });

            // 에러 처리
            if (!response.ok) {
                const text = await response.text();
                // 백엔드 쿼리 에러(500) 등이 났을 때 로그 확인용
                throw new Error(`위치 조회 실패(${response.status}): ${text}`);
            }

            return await response.json();
        } catch (error: any) {
            // 네트워크 에러 처리
            if (error?.message === "Network request failed" || error?.message?.includes("network") || error?.code === "NETWORK_ERROR") {
                console.error('🚨 위치 기반 조회 네트워크 에러:', error);
                return []; // 네트워크 에러는 조용히 빈 배열 반환
            }
            console.error('🚨 위치 기반 조회 에러:', error);
            return []; // 에러 나면 빈 배열 반환해서 앱 죽는 것 방지
        }
    },

    /**
     * ✅ 2. 찜한 목록 조회
     * 로그인이 안 되어 있으면(토큰 없음/403) 그냥 빈 배열을 줍니다.
     */
    getSavedCourses: async () => {
        try {
            const headers = await getHeaders();

            // 토큰이 없으면 요청도 보내지 않음
            if (!headers['Authorization']) return [];

            const url = `${BASE_URL}/api/user-courses`;
            const response = await fetch(url, { method: 'GET', headers });

            // 403(권한 없음)이나 401(인증 실패)이면 조용히 넘김
            if (response.status === 403 || response.status === 401) {
                return [];
            }

            if (!response.ok) throw new Error(`상태: ${response.status}`);
            return await response.json();

        } catch (error) {
            // 로그인 안 된 상태에서는 에러 로그를 굳이 띄우지 않음
            return [];
        }
    },

    /**
     * ✅ 3. 찜하기 토글
     */
    toggleCourseScrap: async (courseId: number) => {
        // 아래에 있는 toggleCourse 함수를 재사용
        return CourseService.toggleCourse(courseId);
    },

    // ---------------------------------------------------------
    // ▼ 기존 함수들 (호환성 유지용 - 지우지 마세요)
    // ---------------------------------------------------------

    getCourses: async (condition: string) => {
        try {
            const headers = await getHeaders();
            let url = `${BASE_URL}/api/courses?category=${condition}`;
            if (condition === 'SAVED') url = `${BASE_URL}/api/user-courses`;

            const response = await fetch(url, { method: 'GET', headers });
            return response.ok ? await response.json() : [];
        } catch (error) {
            return [];
        }
    },

    getCourseDetail: async (id: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/courses/${id}`, { method: 'GET', headers });
            return response.ok ? await response.json() : null;
        } catch (error) {
            return null;
        }
    },

    toggleCourse: async (courseId: number) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${BASE_URL}/api/user-courses/toggle`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ courseId }),
            });
            if (!response.ok) throw new Error(`찜 실패: ${response.status}`);
            return await response.json();
        } catch (error) {
            throw error;
        }
    },
};