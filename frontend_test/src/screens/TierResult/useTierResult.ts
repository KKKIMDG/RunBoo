// src/screens/TierResult/useTierResult.ts
import { useState, useEffect } from 'react';
import { Share, Alert } from 'react-native';
import { evaluateTier } from '../../services/tierService';
import { TierData } from '../../types/tier';

export const useTierResult = (navigation: any) => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 하드코딩된 값 (추후 route.params 등에서 받아오도록 수정 가능)
  const recordId = 2;
  const distanceType = '5k';

  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        const data = await evaluateTier({ distanceType, recordId });
        setTierData(data);
      } catch (err) {
        console.error("API 에러:", err);
        setError('티어 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTier();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `나의 러닝 티어는 ${tierData?.displayName}입니다! 함께 달려요!`,
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
    loading,
    error,
    handleShare,
    handleGoHome,
  };
};