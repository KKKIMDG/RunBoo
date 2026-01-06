import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. 임포트 추가

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
        // 2. 저장된 토큰 꺼내기 (로그인 시 저장한 키 이름이 'accessToken'이라고 가정)
        const token = await AsyncStorage.getItem('accessToken');

        // 토큰이 없으면 요청 보내지 않고 빈 배열 반환 (또는 에러 처리)
        if (!token) {
            console.log('[RunnerService] 토큰이 없습니다. 로그인이 필요합니다.');
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/api/runners/nearby`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 3. Authorization 헤더 추가 (Bearer 뒤에 띄어쓰기 필수!)
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude: lat, longitude: lon, radius }),
        });

        if (!response.ok) {
            // 에러 상태 코드 확인용 로그
            console.log('Server Error Status:', response.status);
            throw new Error();
        }

        return await response.json();
    } catch (error) {
        console.error('[RunnerService Error]', error);
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
                profileImage: undefined,
            }));
            resolve(mockRunners);
        }, 500); // 0.5초 딜레이 (네트워크 흉내)
    });
};