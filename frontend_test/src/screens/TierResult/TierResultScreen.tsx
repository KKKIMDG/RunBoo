// src/screens/TierResult/TierResultScreen.tsx
import React, { FC } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './TierResult.styles';
import { useTierResult } from './useTierResult';
import { TIER_THEMES } from './TierResult.constants'; // 테마 상수 분리 권장
import { TIER_IMAGES } from '@/constants/TierImages';

const TierResultScreen: FC<{ navigation: any }> = ({ navigation }) => {
  const { tierData, loading, error, handleShare, handleGoHome } = useTierResult(navigation);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error || !tierData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
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
            <Text style={[styles.tierTitle, { color: tierData.displayName === '고무신' ? '#FFF' : '#333' }]}>당신의 티어</Text>
          </View>
          <Text style={[styles.tierName, { color: tierData.displayName === '고무신' ? '#FFF' : '#000' }]}>{tierData.displayName}</Text>
          
          <View style={styles.ghostContainer}>
            <Image
              source={TIER_IMAGES[tierData.displayName] || TIER_IMAGES['맨발']}
              style={styles.tierImage}
              resizeMode="contain"
            />
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
            <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color="#FFF" />
              <Text style={[styles.buttonText, { color: '#FFF' }]}>기록 공유하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={handleGoHome}>
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