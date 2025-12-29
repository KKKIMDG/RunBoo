import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from './TierResult.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import BackButton from '@/components/ui/BackButton';

import { TIER_ID_MAP, TIER_THEMES, TierKey } from './TierResult.constants';
import { TIER_IMAGES } from '@/constants/TierImages';

/**
 * ======================================================
 * 🔧 더미 티어 / 결과 데이터 (API 미연결 상태)
 * ======================================================
 */

// TODO(API): 서버에서 계산된 티어 키를 받아오도록 변경
// TODO(API): 서버 응답
const apiTierId = 2; // 예: 서버에서 내려온 숫자

// 변환
const tierKey: TierKey =
  TIER_ID_MAP[apiTierId];

// TODO(API): 러닝 결과를 서버에서 조회하도록 변경
const DUMMY_RESULT = {
  distance: '5.24',
  time: '25:34',
  pace: `4'52"`,
  points: 150,
};

const TierResultScreen = ({ navigation }: any) => {
  const colorScheme = useColorScheme() ?? 'light';

  /**
   * ======================================================
   * 🔧 더미 데이터 사용
   * ======================================================
   */
  const theme = TIER_THEMES[tierKey];
  const tierImage = TIER_IMAGES[tierKey];

  console.log('티어 키', tierKey);
  console.log('이미지 경로', tierImage);

  return (
    <View style={styles.container}>
      {/* ================= 배경 그라데이션 ================= */}
      <LinearGradient
        colors={theme.colors}
        style={styles.gradient}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'transparent']}
        style={styles.shineGradient}
      />

      {/* ================= 상단 티어 영역 ================= */}
      <View style={styles.topSection}>
        <View
          style={[
            styles.tierLabelBox,
            { backgroundColor: theme.point },
          ]}
        >
          <Text style={styles.tierTitle}>
            티어측정 결과
          </Text>
        </View>

        <Text style={styles.tierName}>
          {theme.label}
        </Text>

        <View style={styles.ghostContainer}>
          <View style={styles.tierImageGlow} />
          {tierImage && (
            <Image
              source={tierImage}
              style={styles.tierImage}
            />
          )}
        </View>
      </View>

      {/* ================= 하단 분석 영역 ================= */}
      <View style={styles.bottomSheet}>
        <View style={styles.analysisHeader}>
          <View
            style={[
              styles.checkBadge,
              { backgroundColor: theme.colors[1] },
            ]}
          >
            <Text style={styles.checkText}>
              CHECK
            </Text>
          </View>
          <Text style={styles.analysisTitle}>
            러닝 측정 분석
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons
              name="map-outline"
              size={20}
              color="#999"
            />
            <Text style={styles.statLabel}>
              거리
            </Text>
            <Text style={styles.statValue}>
              {DUMMY_RESULT.distance}
              <Text style={styles.statUnit}> km</Text>
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#999"
            />
            <Text style={styles.statLabel}>
              시간
            </Text>
            <Text style={styles.statValue}>
              {DUMMY_RESULT.time}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons
              name="speedometer-outline"
              size={20}
              color="#999"
            />
            <Text style={styles.statLabel}>
              페이스
            </Text>
            <Text
              style={[
                styles.statValue,
                styles.paceValue,
                { color: theme.colors[1] },
              ]}
            >
              {DUMMY_RESULT.pace}
              <Text style={styles.statUnit}> /km</Text>
            </Text>
          </View>
        </View>

        {/* ================= 버튼 영역 ================= */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.shareButton,
              { backgroundColor: theme.colors[1] },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="share-social"
              size={20}
              color="#FFF"
            />
            <Text
              style={[
                styles.buttonText,
                styles.whiteText,
              ]}
            >
              기록 자랑하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.homeButton,
            ]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color={
                colorScheme === 'dark'
                  ? '#FFF'
                  : '#000'
              }
            />
            <Text
              style={[
                styles.buttonText,
                styles.blackText,
              ]}
            >
              홈으로 돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 백 버튼 ================= */}
      <View
        style={{
          position: 'absolute',
          top: 50,
          left: 20,
          zIndex: 100,
        }}
      >
        <BackButton />
      </View>
    </View>
  );
};

export default TierResultScreen;