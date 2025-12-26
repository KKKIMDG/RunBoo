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
import { ColorValue } from 'react-native';
import { TIER_IMAGES } from '@/constants/TierImages';

// iOS 시뮬레이터 전용 주소
const SERVER_URL = 'http://localhost:8080';

/* =========================
   티어 테마 및 데이터 정의
========================= */
type TierTheme = {
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  point: string;
};

const TIER_THEMES: Record<string, TierTheme> = {
  '맨발': { colors: ['#F3E5D8', '#E2CFC0'], point: '#8D6E63' },
  '짚신': { colors: ['#FFF9C4', '#F0E68C'], point: '#FBC02D' },
  '슬리퍼': { colors: ['#F5F5F5', '#E0E0E0'], point: '#9E9E9E' },
  '고무신': { colors: ['#2C2C2C', '#0A0A0A'], point: '#BDBDBD' },
  '구두': { colors: ['#FFD54F', '#FFB300'], point: '#FFA000' },
  '크리스탈 운동화': { colors: ['#B3E5FC', '#4FC3F7'], point: '#03A9F4' },
};

const TierResultScreen: FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 테스트를 위해 recordId 1, distanceType 5k 하드코딩
  const recordId = 2;
  const distanceType = '5k';

  /* =========================
     티어 분석 API 요청
  ========================= */
  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        const data = await evaluateTier({ distanceType, recordId });
        setTierData(data);
        console.log("티어 데이터 로드 성공:", data.displayName);
      } catch (err) {
        console.error("API 에러:", err);
        setError('티어 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchTier();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error || !tierData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FF6467' }}>{error}</Text>
      </View>
    );
  }

  const currentTheme = TIER_THEMES[tierData.displayName] || TIER_THEMES['맨발'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={tierData.displayName === '고무신' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={currentTheme.colors} style={styles.gradient} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topSection}>
          <View style={styles.tierLabelBox}>
            <Text style={[styles.tierTitle, { color: tierData.displayName === '고무신' ? '#FFF' : '#333' }]}>
              당신의 티어
            </Text>
          </View>

          <Text style={[styles.tierName, { color: tierData.displayName === '고무신' ? '#FFF' : '#000' }]}>
            {tierData.displayName}
          </Text>

         <View style={styles.ghostContainer}>
          {tierData?.displayName && (
            <Image
              // 서버 URL 대신 로컬 매핑 객체 사용
              source={TIER_IMAGES[tierData.displayName] || TIER_IMAGES['맨발']}
              style={{ width: 160, height: 160 }}
              resizeMode="contain"
            />
          )}
        </View>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.analysisHeader}>
            <View style={[styles.checkBadge, { backgroundColor: currentTheme.point }]}>
              <Text style={styles.checkText}>검사</Text>
            </View>
            <Text style={styles.analysisTitle}>러닝 분석 결과</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatItem icon="location-outline" label="거리" value="5.0" unit="km" point={currentTheme.point} />
            <StatItem icon="time-outline" label="시간" value="0:10" unit="분:초" point={currentTheme.point} />
            <StatItem icon="speedometer-outline" label="페이스" value="4'00" unit="/km" point={currentTheme.point} isPace />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={() => Alert.alert("공유", "준비 중")}>
              <Ionicons name="share-social-outline" size={22} color="#FFF" />
              <Text style={[styles.buttonText, { color: '#FFF' }]}>기록 공유하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={() => navigation.navigate('Home')}>
              <Ionicons name="home-outline" size={22} color="#000" />
              <Text style={[styles.buttonText, { color: '#000' }]}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const StatItem = ({ icon, label, value, unit, point, isPace }: any) => (
  <View style={styles.statItem}>
    <Ionicons name={icon} size={22} color={isPace ? point : '#888'} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, isPace && { color: point }]}>{value}</Text>
    <Text style={styles.statUnit}>{unit}</Text>
  </View>
);

export default TierResultScreen;