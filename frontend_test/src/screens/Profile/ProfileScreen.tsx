import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavBar } from '@/components/layout/BottomNavBar'; //
import BackButton from '@/components/ui/BackButton'; //
import { styles } from './ProfileScreen.styles'; //

// 활동 잔디 더미 데이터 생성 (7열 x 12행 기준)
const GRASS_DATA = Array.from({ length: 7 }, () =>
  Array.from({ length: 12 }, () => Math.floor(Math.random() * 3)) // 0: 없음, 1: 5km 미만, 2: 5km 이상
);

export default function ProfileScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더: 뒤로가기 - 제목 - 설정버튼 수평 배치 */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>프로필</Text>
        
        {/* ★ 설정 버튼 연결: 클릭 시 '설정' 화면으로 이동 */}
        <TouchableOpacity 
          style={styles.headerRightIcon}
          onPress={() => navigation.navigate('설정')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 카드 1: 유저 정보 및 메트릭 박스 */}
        <View style={styles.card}>
          <View style={styles.userHeaderRow}>
            <View style={styles.profileImagePlaceholder}>
              {/* 실제 로고 이미지 사용 */}
              <Image 
                source={require('@/assets/images/runboo.png')} 
                style={{ width: 45, height: 45 }} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.userName}>러너</Text>
          </View>

          {/* 3개의 수치 박스 영역 */}
          <View style={styles.metricsRow}>
            {/* 첫 번째 박스: 5KM */}
            <View style={styles.metricBox}>
              <View style={[styles.metricIconPlaceholder, { backgroundColor: '#F3E5D8' }]} />
              <Text style={styles.metricLabel}>5KM</Text>
            </View>

            {/* 두 번째 박스: 10KM */}
            <View style={styles.metricBox}>
              <View style={[styles.metricIconPlaceholder, { backgroundColor: '#B3E5FC' }]} />
              <Text style={styles.metricLabel}>10KM</Text>
            </View>

            {/* 세 번째 박스: 총 KM */}
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>342</Text>
              <Text style={styles.metricSubLabel}>총 KM</Text>
            </View>
          </View>

          {/* 획득한 배지 섹션 */}
          <View style={styles.badgeSectionHeader}>
            <Text style={styles.badgeSectionTitle}>획득한 배지</Text>
            <Ionicons name="arrow-forward-circle-outline" size={20} color="#ADB5BD" />
          </View>
          <View style={styles.badgeList}>
            <View style={styles.badgeIconPlaceholder}>
              <Ionicons name="trophy" size={24} color="#3A4A98" />
            </View>
          </View>
        </View>

        {/* 중앙 통계 요약 (카드 밖 수평 배치) */}
        <View style={styles.statsSummaryRow}>
          <View style={styles.miniStatCard}>
            <View style={styles.miniStatIconBox}>
              <Ionicons name="flame" size={18} color="#3A4A98" />
            </View>
            <View>
              <Text style={styles.miniStatLabel}>연속 일수</Text>
              <Text style={styles.miniStatValue}>12</Text>
            </View>
          </View>

          <View style={styles.miniStatCard}>
            <View style={styles.miniStatIconBox}>
              <Ionicons name="ribbon" size={18} color="#000" />
            </View>
            <View>
              <Text style={styles.miniStatLabel}>배지 갯수</Text>
              <Text style={styles.miniStatValue}>13</Text>
            </View>
          </View>
        </View>

        {/* 카드 2: 활동 잔디 */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.headerTitle, { fontSize: 16 }]}>활동 잔디</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#F1F3F5' }]} />
                <Text style={styles.legendText}>없음</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: 'rgba(58, 74, 152, 0.3)' }]} />
                <Text style={styles.legendText}>5km미만</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: '#3A4A98' }]} />
                <Text style={styles.legendText}>5km이상</Text>
              </View>
            </View>
          </View>

          <View style={styles.grassGrid}>
            {GRASS_DATA.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.grassRow}>
                {row.map((cell, cellIndex) => (
                  <View 
                    key={`cell-${cellIndex}`}
                    style={[
                      styles.grassCell,
                      { backgroundColor: cell === 2 ? '#3A4A98' : cell === 1 ? 'rgba(58, 74, 152, 0.3)' : '#F1F3F5' }
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={styles.grassFooter}>
            <Text style={styles.grassFooterText}>3개월 전</Text>
            <Text style={styles.grassFooterText}>오늘</Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단바 활성 탭 설정 */}
      <BottomNavBar activeTab="프로필" /> 
    </SafeAreaView>
  );
}