// src/screens/Challange/ChallengeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './Challenge.styles';
import { useChallenge, Challenge } from './useChallenge';
import { BottomNavBar, NavTab } from '@/components/layout/BottomNavBar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TIER_IMAGES } from '@/constants/TierImages';
import BackButton from '@/components/ui/BackButton';
import { useNavigation } from '@react-navigation/native';

const ChallengeScreen = ({ navigation: defaultNavigation }: any) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);
  const { challenges, loading } = useChallenge(navigation);
  const [activeStatus, setActiveStatus] = useState<'진행 중' | '완료'>('진행 중');

  const renderCompletedItem = ({ item }: { item: Challenge }) => (
    <View style={styles.completedCard}>
      <View style={styles.badgeIconBox}>
        <Ionicons name="medal" size={32} color="#3A4A98" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title} 완료</Text>
        <Text style={styles.cardDate}>완료: 2024.11.20</Text>
        <Text style={styles.cardReward}>배지</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#3A4A98" />
    </View>
  );

  // 진행 중 아이템 렌더링
  const renderProgressItem = ({ item }: { item: Challenge }) => (
    <TouchableOpacity style={[styles.completedCard, { flexDirection: 'column', alignItems: 'flex-start' }]}>
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Ionicons name="timer-outline" size={20} color="#868E96" />
       </View>
       <Text style={[styles.cardDate, { marginBottom: 10 }]}>{item.description}</Text>
       <View style={{ height: 8, width: '100%', backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${item.progress}%`, backgroundColor: '#3A4A98' }} />
       </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 1. 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>도전과제</Text>
          <Text style={styles.headerSubtitle}>목표를 달성하고 보상을 받으세요</Text>
        </View>

        {/* 2. 탭 버튼 */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity 
            style={[styles.tabButton, activeStatus === '진행 중' && styles.tabButtonActive]}
            onPress={() => setActiveStatus('진행 중')}
          >
            <Ionicons name="time-outline" size={18} color={activeStatus === '진행 중' ? '#FFF' : '#868E96'} />
            <Text style={[styles.tabButtonText, activeStatus === '진행 중' && styles.tabButtonTextActive]}>진행 중</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeStatus === '완료' && styles.tabButtonActive]}
            onPress={() => setActiveStatus('완료')}
          >
            <Ionicons name="checkmark-done-outline" size={18} color={activeStatus === '완료' ? '#FFF' : '#868E96'} />
            <Text style={[styles.tabButtonText, activeStatus === '완료' && styles.tabButtonTextActive]}>완료</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3A4A98" />
        ) : (
          <FlatList
            data={challenges.filter(c => activeStatus === '완료' ? c.isCompleted : !c.isCompleted)}
            renderItem={activeStatus === '완료' ? renderCompletedItem : renderProgressItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            ListHeaderComponent={activeStatus === '완료' ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="trophy-outline" size={24} color="#000" />
                  <Text style={styles.summaryHeaderText}>달성 현황</Text>
                </View>
                <View style={styles.summaryValueContainer}>
                  <Text style={styles.summaryValue}>12</Text>
                  <Text style={styles.summaryLabel}>완료</Text>
                </View>
              </View>
            ) : null}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChallengeScreen;