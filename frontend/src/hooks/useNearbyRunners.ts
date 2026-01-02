import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
// ✅ fetchMockRunners는 이제 필요 없으니 지우거나 안 써도 됩니다.
import { NearbyRunner, fetchNearbyRunnersAPI } from '@/services/user/runnerService';

export const useNearbyRunners = (isFocused: boolean) => {
    const [nearbyRunners, setNearbyRunners] = useState<NearbyRunner[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 🔄 데이터 갱신 함수
    const updateRunners = async () => {
        try {
            // 1. 내 현재 위치 가져오기
            // (권한은 메인 화면에서 이미 받았다고 가정)
            const location = await Location.getLastKnownPositionAsync({});
            if (!location) return;

            const { latitude, longitude } = location.coords;

            // 2. ✅ [수정 완료] 실제 백엔드 API 호출!
            // 내 위치(lat, lon)를 보내고, 주변 반경 3km(기본값) 내의 러너들을 받아옵니다.
            const data = await fetchNearbyRunnersAPI(latitude, longitude);

            // console.log("📡 받아온 주변 러너 수:", data.length); // 디버깅용 로그

            // 3. 상태 업데이트
            setNearbyRunners(data);

        } catch (error) {
            console.log("주변 러너 불러오기 실패:", error);
        }
    };

    // ⏱️ 3초마다 실행 (화면이 포커스 된 상태일 때만)
    useEffect(() => {
        if (isFocused) {
            updateRunners(); // 들어오자마자 즉시 1회 실행
            intervalRef.current = setInterval(updateRunners, 3000); // 이후 3초마다 반복
        } else {
            // 화면을 벗어나면 타이머 정지 (배터리/데이터 절약)
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isFocused]);

    return { nearbyRunners };
};