import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import BackButton from '@/components/ui/BackButton';
import { styles } from './ProfileScreen.styles';

const GRASS_DATA = Array.from({ length: 7 }, () =>
  Array.from({ length: 12 }, () => Math.floor(Math.random() * 3))
);

export default function ProfileScreen({ navigation }: any) {
  const handleTabPress = (tabName: string) => {
    if (tabName === '홈') navigation.navigate('Home');
    if (tabName === '코스') navigation.navigate('Course');
    if (tabName === '통계') navigation.navigate('Records');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity 
          style={styles.headerRightIcon}
          onPress={() => navigation.navigate('Settings')} // 설정 화면 연결
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.userHeaderRow}>
            <View style={styles.profileImagePlaceholder}>
              <Image 
                source={require('@/assets/images/runboo.png')} 
                style={{ width: 45, height: 45 }} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.userName}>러너</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <View style={[styles.metricIconPlaceholder, { backgroundColor: '#F3E5D8' }]} />
              <Text style={styles.metricLabel}>5KM</Text>
            </View>
            <View style={styles.metricBox}>
              <View style={[styles.metricIconPlaceholder, { backgroundColor: '#B3E5FC' }]} />
              <Text style={styles.metricLabel}>10KM</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>342</Text>
              <Text style={styles.metricSubLabel}>총 KM</Text>
            </View>
          </View>

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

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.headerTitle, { fontSize: 16 }]}>활동 잔디</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#F1F3F5' }]} /><Text style={styles.legendText}>없음</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: 'rgba(58, 74, 152, 0.3)' }]} /><Text style={styles.legendText}>5km미만</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#3A4A98' }]} /><Text style={styles.legendText}>5km이상</Text></View>
            </View>
          </View>
          <View style={styles.grassGrid}>
            {GRASS_DATA.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.grassRow}>
                {row.map((cell, cellIndex) => (
                  <View key={`cell-${cellIndex}`} style={[styles.grassCell, { backgroundColor: cell === 2 ? '#3A4A98' : cell === 1 ? 'rgba(58, 74, 152, 0.3)' : '#F1F3F5' }]} />
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
      <BottomNavBar activeTab="프로필" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}
