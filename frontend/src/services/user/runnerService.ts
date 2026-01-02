import { API_BASE_URL } from '@env';

// 1. 주변 러너 데이터 타입 정의
export interface NearbyRunner {
    userId: number;
    nickname: string;
    latitude: number;
    longitude: number;
    profileImageUrl?: string; // 프로필 이미지 URL (없으면 null)
}

// 2. [실제 API] 서버에 내 위치를 보내고 주변 러너를 받아오는 함수
export const fetchNearbyRunnersAPI = async (
    lat: number,
    lon: number,
    radius: number = 3000 // 기본값 3km
): Promise<NearbyRunner[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/runners/nearby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: lat, longitude: lon, radius }),
        });

        if (!response.ok) throw new Error('주변 러너 조회 실패');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

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
                profileImage: undefined,
            }));
            resolve(mockRunners);
        }, 500); // 0.5초 딜레이 (네트워크 흉내)
    });
};