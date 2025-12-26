import React, { FC } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './TierResult.styles';
import { useTierResult } from './useTierResult';
import ActionButton from '@/components/ui/ActionButton'; // 새로 만든 버튼 임포트

const TierResultScreen: FC = () => {
  const { loading, error, tierData, currentTheme, stats, serverUrl, handlers } = useTierResult();
  const styles = getStyles(currentTheme);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={currentTheme.point} />
        <Text style={{ marginTop: 10, color: currentTheme.text }}>티어 분석 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{color: currentTheme.text}}>{error}</Text>
        <ActionButton
          title="홈으로 돌아가기"
          variant="secondary"
          onPress={handlers.handleGoHome}
          style={{ marginTop: 20 }}
          theme={currentTheme}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={tierData?.displayName === '고무신' ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={currentTheme.colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topSection}>
          <View style={styles.tierLabelBox}>
            <Text style={styles.tierTitle}>
              당신의 티어
            </Text>
          </View>
          <Text style={styles.tierName}>
            {tierData?.displayName}
          </Text>
          <View style={styles.ghostContainer}>
            {tierData?.imageUrl && (
              <Image
                source={{ uri: `${serverUrl}${tierData.imageUrl}` }}
                style={{ width: 160, height: 160 }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
        <View style={styles.bottomSheet}>
          <View style={styles.analysisHeader}>
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>검사</Text>
            </View>
            <Text style={styles.analysisTitle}>러닝 분석 결과</Text>
          </View>
          <View style={styles.statsGrid}>
            {stats.map((item, index) => (
              <View key={index} style={styles.statItem}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.isPace ? currentTheme.point : currentTheme.icon}
                />
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, item.isPace && { color: currentTheme.point }]}>
                  {item.value}
                </Text>
                <Text style={styles.statUnit}>{item.unit}</Text>
              </View>
            ))}
          </View>
          <View style={styles.buttonGroup}>
            <ActionButton
              title="기록 공유하기"
              variant="primary"
              icon="share-social-outline"
              onPress={handlers.handleShare}
              theme={currentTheme}
            />
            <ActionButton
              title="홈으로 돌아가기"
              variant="secondary"
              icon="home-outline"
              onPress={handlers.handleGoHome}
              theme={currentTheme}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default TierResultScreen;