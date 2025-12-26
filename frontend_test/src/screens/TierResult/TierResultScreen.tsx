// src/screens/TierResult/TierResultScreen.tsx

import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './TierResult.styles';
import { TierData } from '../../types/tier';
import { evaluateTier } from '../../services/tierService';
import { BASE_URL } from '../../services/api';
import { ColorValue } from 'react-native';

const SERVER_URL = 'http://localhost:8080';

/* =========================
   티어 테마 타입 정의
========================= */
type TierTheme = {
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  point: string;
};

/* =========================
   티어별 테마
========================= */
const TIER_THEMES: Record<string, TierTheme> = {
  '맨발': {
    colors: ['#F3E5D8', '#E2CFC0'],
    point: '#8D6E63',
  },
  '짚신': {
    colors: ['#FFF9C4', '#F0E68C'],
    point: '#FBC02D',
  },
  '슬리퍼': {
    colors: ['#F5F5F5', '#E0E0E0'],
    point: '#9E9E9E',
  },
  '고무신': {
    colors: ['#2C2C2C', '#0A0A0A'],
    point: '#BDBDBD',
  },
  '구두': {
    colors: ['#FFD54F', '#FFB300'],
    point: '#FFA000',
  },
  '크리스탈 운동화': {
    colors: ['#B3E5FC', '#4FC3F7'],
    point: '#03A9F4',
  },
};

/* =========================
   통계 데이터 타입
========================= */
interface StatData {
  label: string;
  value: string;
  unit: string;
  icon: string;
  isPace?: boolean;
}

const TierResultScreen: FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 내비게이션 파라미터에서 recordId와 distanceType 추출
  // (Fallback 값은 개발 중 빠른 테스트를 위함)
  const { recordId, distanceType } = route.params || {};

  /* =========================
     현재 티어 테마
     (기본값: 맨발)
  ========================= */
  const currentTheme: TierTheme =
      tierData && TIER_THEMES[tierData.displayName]
          ? TIER_THEMES[tierData.displayName]
          : TIER_THEMES['맨발'];

  /* =========================
     더미 통계 데이터
  ========================= */
  const dummyStats: StatData[] = [
    { label: '거리', value: '5.0', unit: 'km', icon: 'location-outline' },
    { label: '시간', value: '0:10', unit: '분:초', icon: 'time-outline' },
    {
      label: '페이스',
      value: "4'00",
      unit: '/km',
      icon: 'speedometer-outline',
      isPace: true,
    },
  ];

  /* =========================
     티어 분석 요청
  ========================= */
  useEffect(() => {
    if (!recordId || !distanceType) {
      setError('티어 분석에 필요한 정보가 없습니다.');
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      try {
        setLoading(true);
        const data = await evaluateTier({
          distanceType,
          recordId,
        });
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

  /* =========================
     공유
  ========================= */
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
    // navigation prop을 사용하여 홈 화면으로 이동
    navigation.navigate('Home');
  };

  /* =========================
     로딩 / 에러 처리
  ========================= */
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
          <Text style={{ color: '#FF6467', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity
              style={[styles.button, styles.homeButton, { marginTop: 20 }]}
              onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, styles.blackText]}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>
    );
  }

  /* =========================
     렌더링
  ========================= */
  return (
      <View style={styles.container}>
        <StatusBar
            barStyle={tierData?.displayName === '고무신' ? 'light-content' : 'dark-content'}
        />

        {/* 배경 그라데이션 */}
        <LinearGradient
            colors={currentTheme.colors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        />

        <SafeAreaView style={{ flex: 1 }}>
          {/* 상단 */}
          <View style={styles.topSection}>
            <View style={[styles.tierLabelBox, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Text
                  style={[
                    styles.tierTitle,
                    { color: tierData?.displayName === '고무신' ? '#FFF' : '#333' },
                  ]}
              >
                당신의 티어
              </Text>
            </View>

            <Text
                style={[
                  styles.tierName,
                  { color: tierData?.displayName === '고무신' ? '#FFF' : '#000' },
                ]}
            >
              {tierData?.displayName}
            </Text>

            <View style={styles.ghostContainer}>
              {tierData?.imageUrl && (
                  <Image
                      // SERVER_URL과 tierData.imageUrl 사이에 중복된 경로가 없는지 확인해야 합니다.
                      // 백엔드에서 '/tier/image/shoes.png'를 준다면 아래와 같이 결합합니다.
                      source={{ uri: `${SERVER_URL}${tierData.imageUrl}` }}
                      style={{ width: 160, height: 160 }}
                      resizeMode="contain"
                      // 이미지가 뜨지 않을 때 에러를 확인하기 위해 추가
                      onError={(e) => console.log("이미지 로딩 에러:", e.nativeEvent.error)}
                  />
              )}
            </View>
          </View>

          {/* 하단 시트 */}
          <View style={styles.bottomSheet}>
            <View style={styles.analysisHeader}>
              <View style={[styles.checkBadge, { backgroundColor: currentTheme.point }]}>
                <Text style={styles.checkText}>검사</Text>
              </View>
              <Text style={styles.analysisTitle}>러닝 분석 결과</Text>
            </View>

            {/* 통계 */}
            <View style={styles.statsGrid}>
              {dummyStats.map((item, index) => (
                  <View key={index} style={styles.statItem}>
                    <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={item.isPace ? currentTheme.point : '#888'}
                    />
                    <Text style={styles.statLabel}>{item.label}</Text>
                    <Text style={[styles.statValue, item.isPace && { color: currentTheme.point }]}>
                      {item.value}
                    </Text>
                    <Text style={styles.statUnit}>{item.unit}</Text>
                  </View>
              ))}
            </View>

            {/* 버튼 */}
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
