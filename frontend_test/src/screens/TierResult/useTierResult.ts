
import { useState, useEffect } from 'react';
import { Share, Alert, ColorValue } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { evaluateTier } from '@/services/tierService';
import { TierData } from '@/types/tier';
import { Colors } from '@/constants/theme';

// 네비게이션 파라미터 타입 정의
type RootStackParamList = {
  TierResult: { recordId: number; distanceType: '3k' | '5k' | '10k' };
};

type TierResultRouteProp = RouteProp<RootStackParamList, 'TierResult'>;

// 테마 및 통계 데이터 타입 정의
export type TierTheme = {
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  point: string;
  text: string;
  background: string;
  card: string;
  icon: string;
};

interface StatData {
  label: string;
  value: string;
  unit: string;
  icon: string;
  isPace?: boolean;
}

// 상수 정의
const SERVER_URL = 'http://localhost:8080';
const TIER_THEMES: Record<string, TierTheme> = {
    '맨발': { ...Colors.light, colors: ['#F3E5D8', '#E2CFC0'], point: '#8D6E63' },
    '짚신': { ...Colors.light, colors: ['#FFF9C4', '#F0E68C'], point: '#FBC02D' },
    '슬리퍼': { ...Colors.light, colors: ['#F5F5F5', '#E0E0E0'], point: '#9E9E9E' },
    '고무신': { ...Colors.dark, colors: ['#2C2C2C', '#0A0A0A'], point: '#BDBDBD' },
    '구두': { ...Colors.light, colors: ['#FFD54F', '#FFB300'], point: '#FFA000' },
    '크리스탈 운동화': { ...Colors.light, colors: ['#B3E5FC', '#4FC3F7'], point: '#03A9F4' },
};
const DEFAULT_THEME = TIER_THEMES['맨발'];

export const useTierResult = () => {
    const route = useRoute<TierResultRouteProp>();
    const { recordId, distanceType } = route.params;

    const [tierData, setTierData] = useState<TierData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentTheme = tierData && TIER_THEMES[tierData.displayName] ? TIER_THEMES[tierData.displayName] : DEFAULT_THEME;
    
    // TODO: 실제 기록 데이터와 연동 필요
    const dummyStats: StatData[] = [
        { label: '거리', value: '5.0', unit: 'km', icon: 'location-outline' },
        { label: '시간', value: '0:10', unit: '분:초', icon: 'time-outline' },
        { label: '페이스', value: "4'00", unit: '/km', icon: 'speedometer-outline', isPace: true },
    ];

    useEffect(() => {
        const fetchTier = async () => {
            if (!recordId || !distanceType) {
                setError('티어 분석에 필요한 정보가 부족합니다.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await evaluateTier({ recordId, distanceType });
                setTierData(data);
            } catch (err) {
                console.error(err);
                setError('티어 정보를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchTier();
    }, [recordId, distanceType]);

    const handleShare = async () => {
        try {
            const message = tierData
                ? `오늘 RunBoo에서 '${tierData.displayName}' 티어를 달성했어요! 거리: 5.0km, 페이스: 4'00"`
                : '오늘 RunBoo에서 러닝을 완료했어요!';
            await Share.share({ message });
        } catch {
            Alert.alert('에러', '공유 중 문제가 발생했습니다.');
        }
    };

    const handleGoHome = () => {
        // TODO: 실제 네비게이션 로직으로 교체
        Alert.alert('알림', '홈 화면으로 이동합니다.');
    };

    return {
        loading,
        error,
        tierData,
        currentTheme,
        stats: dummyStats,
        serverUrl: SERVER_URL,
        handlers: {
            handleShare,
            handleGoHome,
        },
    };
};
