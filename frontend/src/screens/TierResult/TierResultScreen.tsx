// src/screens/TierResult/TierResultScreen.tsx

import React, { FC, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Share, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './TierResult.styles';
import { TierData } from '../../types/tier';
import { evaluateTier } from '../../services/tierService';
import { Redirect } from 'expo-router';

const SERVER_URL = 'http://localhost:8080'; 

// 티어별 테마 설정
const TIER_THEMES: { [key: string]: { colors: string[], point: string } } = {
  '맨발': { colors: ['#F3E5D8', '#E2CFC0'], point: '#8D6E63' },
  '짚신': { colors: ['#FFF9C4', '#F0E68C'], point: '#FBC02D' },
  '슬리퍼': { colors: ['#F5F5F5', '#E0E0E0'], point: '#9E9E9E' },
  '고무신': { colors: ['#2C2C2C', '#0A0A0A'], point: '#BDBDBD' },
  '구두': { colors: ['#FFD54F', '#FFB300'], point: '#FFA000' },
  '크리스탈 운동화': { colors: ['#B3E5FC', '#4FC3F7'], point: '#03A9F4' },
};

interface StatData {
  label: string;
  value: string;
  unit: string;
  icon: string;
  isPace?: boolean;
}

const TierResultScreen: FC = () => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 티어에 맞는 테마 가져오기 (기본값: 맨발 테마)
  const currentTheme = tierData ? TIER_THEMES[tierData.displayName] || TIER_THEMES['맨발'] : TIER_THEMES['맨발'];

  // 분석 결과 데이터 (더미 데이터)
  const dummyStats: StatData[] = [
    { label: '거리', value: '5.0', unit: 'km', icon: 'location-outline' },
    { label: '시간', value: '0:10', unit: '분:초', icon: 'time-outline' },
    { label: "페이스", value: "4'00", unit: '/km', icon: 'speedometer-outline', isPace: true },
  ];

  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        // DB 데이터에 맞춰 5k, recordId 2번으로 요청
        const data = await evaluateTier({ 
          distanceType: "5k", 
          recordId: 4
        }); 
        setTierData(data);
      } catch (err) {
        setError('티어 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTier();
  }, []);

  const handleShare = async () => {
    try {
      const message = tierData
        ? `오늘 RunBoo에서 '${tierData.displayName}' 티어를 달성했어요! 거리: 5.0km, 페이스: 4'00"`
        : '오늘 RunBoo에서 러닝을 완료했어요!';
      await Share.share({ message });
    } catch (error) {
      Alert.alert('에러', '공유하는 동안 문제가 발생했습니다.');
    }
  };

  const handleGoHome = () => {
    Alert.alert('알림', '홈 화면으로 이동합니다.');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10 }}>티어 분석 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>{error}</Text>
        <TouchableOpacity style={[styles.button, styles.homeButton, { marginTop: 20 }]} onPress={handleGoHome}>
          <Text style={[styles.buttonText, styles.blackText]}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={tierData?.displayName === '고무신' ? "light-content" : "dark-content"} />
      
      {/* 티어에 따른 동적 그라데이션 적용 */}
      <LinearGradient 
        colors={currentTheme.colors}
        style={styles.gradient} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 50, y: 50 }} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* 상단 섹션 */}
        <View style={styles.topSection}>
          <View style={[styles.tierLabelBox, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Text style={[styles.tierTitle, { color: tierData?.displayName === '고무신' ? '#FFF' : '#333' }]}>당신의 티어</Text>
          </View>
          <Text style={[styles.tierName, { color: tierData?.displayName === '고무신' ? '#FFF' : '#000' }]}>
            {tierData?.displayName || '분석 중'}
          </Text>
          
          <View style={styles.ghostContainer}>
            {tierData?.imageUrl && (
              <Image 
                source={{ uri: `${SERVER_URL}${tierData.imageUrl}` }} 
                style={{ width: 160, height: 160 }} 
                resizeMode="contain" 
              />
            )}
          </View>
        </View>

        {/* 하단 리포트 시트 */}
        <View style={styles.bottomSheet}>
          <View style={styles.analysisHeader}>
            <View style={[styles.checkBadge, { backgroundColor: currentTheme.point }]}>
              <Text style={styles.checkText}>검사</Text>
            </View>
            <Text style={styles.analysisTitle}>러닝 분석 결과</Text>
          </View>

          {/* 통계 그리드 */}
          <View style={styles.statsGrid}>
            {dummyStats.map((item, index) => (
              <View key={index} style={styles.statItem}>
                <Ionicons name={item.icon as any} size={22} color={item.isPace ? currentTheme.point : "#888"} />
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, item.isPace && { color: currentTheme.point }]}>
                  {item.value}
                </Text>
                <Text style={styles.statUnit}>{item.unit}</Text>
              </View>
            ))}
          </View>

          {/* 하단 버튼 그룹 */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.button, styles.shareButton]} 
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={22} color="#FFF" />
              <Text style={[styles.buttonText, styles.whiteText]}>기록 공유하기</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.homeButton]} 
              activeOpacity={0.8}
              onPress={handleGoHome}
            >
              <Ionicons name="home-outline" size={22} color="#000" />
              <Text style={[styles.buttonText, styles.blackText]}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default TierResultScreen;