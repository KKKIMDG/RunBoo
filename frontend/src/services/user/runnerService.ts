import { api } from '@/services/api';

// 1. 주변 러너 데이터 타입 정의
export interface NearbyRunner {
    userId: number;
    nickname: string;
    latitude: number;
    longitude: number;
    profileImageUrl?: string;
}

// 2. [실제 API] 수정된 함수 - api.ts의 공통 함수 사용
export const fetchNearbyRunnersAPI = async (
    lat: number,
    lon: number,
    radius: number = 3000
): Promise<NearbyRunner[]> => {
    try {
        // api.post를 사용하여 공통 에러 처리 및 ATS 설정 적용
        const data: any = await api.post('/api/runners/nearby', {
            latitude: lat,
            longitude: lon,
            radius,
        });

        // API 응답이 배열이 아닐 수 있으므로 안전하게 처리
        if (Array.isArray(data)) {
            return data;
        }
        
        // 응답이 객체로 감싸져 있을 경우 처리
        if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
            return data.data;
        }
        
        return [];
    } catch (error: any) {
        // 네트워크 에러나 기타 에러 처리
        console.error('[RunnerService Error]', error);
        
        // 네트워크 에러는 조용히 빈 배열 반환 (3초마다 재시도하므로)
        if (error?.status === 0 || error?.message?.includes('네트워크')) {
            console.log('[RunnerService] 네트워크 연결 실패, 빈 배열 반환');
            return [];
        }
        
        // 기타 에러도 빈 배열 반환하여 앱이 중단되지 않도록
        return [];
    }
};

// ... (fetchMockRunners는 그대로 두셔도 됩니다)

// 3. [테스트용] 가짜 데이터 생성 함수 (백엔드 없을 때 사용)
// 내 위치 주변에 랜덤하게 3~5명의 러너를 생성합니다.
export const fetchMockRunners = async (lat: number, lon: number): Promise<NearbyRunner[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockRunners: NearbyRunner[] = Array.from({ length: 4 }).map((_, i) => ({
                userId: 100 + i,
                nickname: `러너${100 + i}`,
                // 내 위치 기준 ±0.005도 (약 500m~1km) 내외로 랜덤 좌표 생성
                latitude: lat + (Math.random() - 0.5) * 0.01,
                longitude: lon + (Math.random() - 0.5) * 0.01,
                profileImageUrl: undefined,
            }));
            resolve(mockRunners);
        }, 500); // 0.5초 딜레이 (네트워크 흉내)
    });
};