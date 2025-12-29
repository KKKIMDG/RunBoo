import { useState, useEffect } from 'react';
import { Share, Alert } from 'react-native';
import { evaluateTier } from '../../services/tierService';
import { TierData } from '../../types/tier';
import { TierKey } from './TierResult.constants';

export const useTierResult = (navigation: any, route: any) => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recordId = route?.params?.recordId;
  const distanceType = route?.params?.distanceType;

  useEffect(() => {
    const fetchTier = async () => {
      if (!recordId) {
        setLoading(false);
        setError('유효하지 않은 측정 기록입니다.');
        return;
      }

      try {
        setLoading(true);
        const data = await evaluateTier({ distanceType, recordId });
        console.log("받아온 티어 데이터:", data);
        setTierData(data);
      } catch (err) {
        console.error("API 에러:", err);
        setError('티어 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTier();
  }, [recordId, distanceType]);

  // tierId 숫자 값 또는 이름을 기준으로 TierKey 매핑
  const getTierKey = (): TierKey => {
  if (!tierData) return 'barefoot';

    // 1. 숫자가 오면 숫자로 판별 (1: 맨발, 2: 짚신, 3: 슬리퍼, 4: 고무신, 5: 구두, 6: 다이아)
    const id = (tierData as any).tierId;

  if (id !== undefined) {
    switch (Number(id)) {
      case 1: return 'barefoot';
      case 2: return 'straw';
      case 3: return 'slipper';
      case 4: return 'rubber';
      case 5: return 'shoes';
      case 6: return 'crystal';
    }
  }

    // 2. 이름 문자열로 판별 (폴백)
    const name = tierData.name?.toLowerCase() || '';
  if (name.includes('crystal') || name.includes('다이아')) return 'crystal';
  if (name.includes('shoes') || name.includes('구두')) return 'shoes';
  if (name.includes('rubber') || name.includes('고무')) return 'rubber';
  if (name.includes('slipper') || name.includes('슬리퍼')) return 'slipper';
  if (name.includes('straw') || name.includes('짚')) return 'straw';

  return 'barefoot';
};

  const handleShare = async () => {
    try {
      await Share.share({
        message: `나의 러닝 티어는 [${tierData?.name}]입니다! 함께 달려요!`,
      });
    } catch (error) {
      Alert.alert("공유 실패", "공유하는 도중 오류가 발생했습니다.");
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return {
    tierData,
    tierKey: getTierKey(),
    loading,
    error,
    handleShare,
    handleGoHome,
  };
};