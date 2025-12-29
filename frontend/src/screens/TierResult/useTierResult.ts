import { useState, useEffect } from 'react';
import { Share, Alert } from 'react-native';
import { evaluateTier } from '@/services/tierService';
import { TierData } from '@/types/tier';
import { TIER_NAME_MAP, ServerTierName } from './TierResult.constants';
import { TierName } from './TierResult.constants';

export const useTierResult = (navigation: any, route: any) => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recordId = 1;
  const distanceType = '5k';

  const tierName: TierName | null = tierData
  ? TIER_NAME_MAP[tierData.name as ServerTierName]
  : null;

  // 측정 연결시
  // const recordId = route?.params?.recordId;
  // const distanceType = route?.params?.distanceType;
  useEffect(() => {
    const fetchTier = async () => {
      if (!recordId) {
        setError('유효하지 않은 측정 기록입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await evaluateTier({ distanceType, recordId });
        console.log('받아온 티어 데이터:', data);
        setTierData(data);
      } catch (err) {
        console.error('API 에러:', err);
        setError('티어 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, [recordId, distanceType]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `나의 러닝 티어는 [${tierData?.displayName}]입니다!`,
      });
    } catch {
      Alert.alert('공유 실패', '공유 중 오류가 발생했습니다.');
    }
  };

    return {
    tierData,
    tierName,        // ✅ name 기반으로 결정된 key
    loading,
    error,
    handleShare,  
  };
};