import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { useHomeScreen, RunningMode } from './useHomeScreen';
import { getStyles } from './HomeScreen.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type HomeScreenProps = {
  navigation?: { navigate: (screen: string) => void };
  onLogout?: () => void;
};

const ModeTab: FC<{
  mode: RunningMode;
  activeMode: RunningMode;
  onPress: (mode: RunningMode) => void;
  icon: keyof typeof Ionicons.glyphMap;
  scheme: 'light' | 'dark';
}> = ({ mode, activeMode, onPress, icon, scheme }) => {
  const styles = getStyles(scheme);
  const colors = Colors[scheme];
  return (
    <TouchableOpacity
      style={[styles.tabButton, activeMode === mode && styles.activeTab]}
      onPress={() => onPress(mode)}
    >
      <View style={styles.tabItemContent}>
        <Ionicons name={icon} size={18} color={activeMode === mode ? colors.background : colors.icon} />
        <Text style={[styles.tabText, activeMode === mode && styles.activeTabText]}>{mode}</Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const { activeMode, handleModeChange } = useHomeScreen();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);
  const colors = Colors[colorScheme];
  const handleTabPress = (tabName: string) => {
    if (tabName === '코스') {
      navigation?.navigate('Course');
    }
    if (tabName === '통계') {
      navigation?.navigate('Records');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar onLeftPress={() => navigation?.navigate('Profile')} />

      <View style={styles.content}>
        {/* 1. 모드 선택 탭 */}
        <View style={styles.tabContainer}>
          <ModeTab mode="측정" activeMode={activeMode} onPress={handleModeChange} icon="timer-outline" scheme={colorScheme} />
          <ModeTab mode="티어" activeMode={activeMode} onPress={handleModeChange} icon="ribbon-outline" scheme={colorScheme} />
          <ModeTab mode="고스트" activeMode={activeMode} onPress={handleModeChange} icon="body-outline" scheme={colorScheme} />
        </View>

        {/* 2. 지도 영역 */}
        <View style={styles.mapBox}>
          <View style={styles.mapContent}>
            <Text style={styles.mapPlaceholderText}>카카오맵 영역</Text>
          </View>
          <TouchableOpacity style={styles.zoomBtn}>
            <Ionicons name="eye-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.mapBottomRow}>
            <View style={styles.userCount}>
              <Ionicons name="people-outline" size={16} color={colors.primary} />
              <Text style={styles.countText}>5</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.detailText}>자세히 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. 하단 버튼 섹션 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.blackButton}>
            <Text style={styles.buttonTextMain}>목표 설정</Text>
            <Ionicons name="chevron-down" size={22} color={colors.background} style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.blackButton, styles.startBtn]}>
            <View style={styles.buttonContentCentered}>
              <Ionicons name="play" size={24} color={colors.background} />
              <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>러닝 시작</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavBar activeTab="홈" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

export default HomeScreen;
