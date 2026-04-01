import { api } from '@/services/api';

// 1. 주변 러너 데이터 타입 정의
export interface NearbyRunner {
    userId: number;
    nickname: string;
    latitude: number;
    longitude: number;
    profileImageUrl?: string;
}

// 2. [실제 API] 수정된 함수
export const fetchNearbyRunnersAPI = async (
    lat: number,
    lon: number,
    radius: number = 3000
): Promise<NearbyRunner[]> => {
    try {
        const data: any = await api.post('/api/runners/nearby', {
            latitude: lat,
            longitude: lon,
            radius,
        });

        // API 응답이 배열인 경우
        if (Array.isArray(data)) {
            return data;
        }

        // API 응답이 { data: [...] } 형태인 경우
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
            return data.data;
        }

        // 예상치 못한 응답 구조면 빈 배열
        return [];
    } catch (error: any) {
        const status = error?.status;
        const message = error?.message ?? '';

        // 1) 인증 만료/인증 실패는 아예 조용히 무시
        if (status === 401) {
            return [];
        }

        // 2) 네트워크 에러도 조용히 무시
        if (
            status === 0 ||
            message.includes('네트워크') ||
            message.includes('Network Error') ||
            message.includes('fetch')
        ) {
            return [];
        }

        // 3) 그 외 에러만 필요할 때 출력
        console.error('[RunnerService Error]', error);
        return [];
    }
};

// 3. [테스트용] 가짜 데이터 생성 함수
export const fetchMockRunners = async (
    lat: number,
    lon: number
): Promise<NearbyRunner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockRunners: NearbyRunner[] = Array.from({ length: 4 }).map((_, i) => ({
                userId: 100 + i,
                nickname: `러너${100 + i}`,
                latitude: lat + (Math.random() - 0.5) * 0.01,
                longitude: lon + (Math.random() - 0.5) * 0.01,
                profileImageUrl: undefined,
            }));
            resolve(mockRunners);
        }, 500);
    });
};