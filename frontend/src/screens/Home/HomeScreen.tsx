import React, { FC, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform, // ★ 반드시 추가되어야 합니다.
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/layout/TopNavBar'; 
import { BottomNavBar } from '@/components/layout/BottomNavBar';

const HomeScreen: FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const [activeMode, setActiveMode] = useState<'측정' | '티어' | '고스트'>('측정');

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      <View style={styles.content}>
        {/* 1. 모드 선택 탭 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeMode === '측정' && styles.activeTab]} 
            onPress={() => setActiveMode('측정')}
          >
            <View style={styles.tabItemContent}>
              <Ionicons name="timer-outline" size={18} color={activeMode === '측정' ? "#FFF" : "#868E96"} />
              <Text style={[styles.tabText, activeMode === '측정' && styles.activeTabText]}>측정</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeMode === '티어' && styles.activeTab]} 
            onPress={() => setActiveMode('티어')}
          >
            <View style={styles.tabItemContent}>
              <Ionicons name="ribbon-outline" size={18} color={activeMode === '티어' ? "#FFF" : "#868E96"} />
              <Text style={[styles.tabText, activeMode === '티어' && styles.activeTabText]}>티어</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeMode === '고스트' && styles.activeTab]} 
            onPress={() => setActiveMode('고스트')}
          >
            <View style={styles.tabItemContent}>
              <Ionicons name="body-outline" size={18} color={activeMode === '고스트' ? "#FFF" : "#868E96"} />
              <Text style={[styles.tabText, activeMode === '고스트' && styles.activeTabText]}>고스트</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. 지도 영역 */}
        <View style={styles.mapBox}>
          <View style={styles.mapContent}>
            <Text style={styles.mapPlaceholderText}>카카오맵 영역</Text>
          </View>
          <TouchableOpacity style={styles.zoomBtn}>
            <Ionicons name="eye-outline" size={22} color="#000" />
          </TouchableOpacity>
          <View style={styles.mapBottomRow}>
            <View style={styles.userCount}>
              <Ionicons name="people-outline" size={16} color="#3A4A98" />
              <Text style={styles.countText}>5</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.detailText}>자세히 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. 하단 버튼 섹션: 글자 정중앙 정렬 유지 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.blackButton}>
            <Text style={styles.buttonTextMain}>목표 설정</Text>
            <Ionicons name="chevron-down" size={22} color="#FFF" style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.blackButton, styles.startBtn]}>
            <View style={styles.buttonContentCentered}>
              <Ionicons name="play" size={24} color="#FFF" />
              <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>러닝 시작</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNavBar activeTab="홈" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        // '100vh' 대신 '100%'를 사용하거나, 강제로 타입을 지정합니다.
        height: '100%' as any, 
      },
      default: {
        flex: 1,
      }
    })
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    // 아이폰과 웹의 여백 차이를 해결하는 로직
    paddingBottom: Platform.select({
      ios: 75, 
      default: 85,
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#3A4A98',
  },
  tabItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#868E96',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFF',
  },
  mapBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
  },
  mapPlaceholderText: {
    color: '#868E96',
    fontSize: 16,
  },
  zoomBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  mapBottomRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  countText: {
    color: '#3A4A98',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  detailText: {
    color: '#3A4A98',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonSection: {
    marginBottom: 0,
  },
  blackButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#000',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
    position: 'relative',
  },
  startBtn: {
    height: 58,
    marginBottom: 0,
  },
  buttonTextMain: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chevronIcon: {
    position: 'absolute', 
    right: 20,
  },
  buttonContentCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;