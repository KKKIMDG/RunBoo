// src/screens/TierResult/TierResultScreen.tsx

import React, { FC, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Share, Alert, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from './TierResult.styles';
import { TierData } from '../../types/tier';
import { evaluateTier } from '../../services/tierService';

/**
 * [중요] 서버 주소 설정
 * 이미지들이 서버의 'src/main/resources/static/tier/image/' 폴더 내에 위치하므로,
 * 서버 주소(예: http://localhost:8080) 뒤에 DB에서 내려주는 상대 경로가 붙어 전체 URL이 완성됩니다.
 */
const SERVER_URL = 'http://localhost:8080'; 

interface StatData {
  label: string;
  value: string;
  unit: string;
  icon: string;
  isPace?: boolean;
}

const TierResultScreen: FC = () => {
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dummyStats: StatData[] = [
    { label: '거리', value: '5.0', unit: 'km', icon: 'location-outline' },
    { label: '시간', value: '0:10', unit: '분:초', icon: 'time-outline' },
    { label: "페이스", value: "4'00", unit: '/km', icon: 'speedometer-outline', isPace: true },
  ];

  useEffect(() => {
    const fetchTier = async () => {
      try {
        setLoading(true);
        // DB의 distance_type '5k', record_id 2 데이터를 기준으로 요청
        const data = await evaluateTier({ 
          distanceType: "5k", 
          recordId: 2
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
  }, []);

  const handleShare = async () => {
    try {
      const message = tierData
        ? `오늘 RunBoo에서 '${tierData.displayName}' 티어를 달성했어요! 거리: 5.0km, 페이스: 4'00"`
        : '오늘 RunBoo에서 러닝을 완료했어요!';
      await Share.share({ message });
    } catch (error) {
      Alert.alert('에러', '공유하는 동안 문제가 발생했습니다.');
    }
  };

  const handleGoHome = () => {
    Alert.alert('알림', '홈 화면으로 이동합니다.');
  };

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
        <Text>{error}</Text>
        <TouchableOpacity style={[styles.button, styles.homeButton, { marginTop: 20 }]} onPress={handleGoHome}>
          <Text style={[styles.buttonText, styles.blackText]}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#b9f2ff', '#e0f7ff']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topSection}>
          <View style={styles.tierLabelBox}>
            <Text style={styles.tierTitle}>당신의 티어</Text>
          </View>
          <Text style={styles.tierName}>{tierData?.displayName || '티어 분석 중'}</Text>
          
          <View style={styles.ghostContainer}>
            {tierData?.imageUrl ? (
              <Image 
                /**
                 * DB 상의 imageUrl이 '/tier/image/shoes.png' 형식이므로
                 * SERVER_URL과 합쳐져 'http://localhost:8080/tier/image/shoes.png'가 호출됩니다.
                 */
                source={{ uri: `${SERVER_URL}${tierData.imageUrl}` }} 
                style={{ width: 160, height: 160 }} 
                resizeMode="contain" 
              />
            ) : (
              // 데이터를 불러오기 전이나 imageUrl이 없을 경우 표시할 기본 아이콘
              <FontAwesome5 name="ghost" size={100} color="#6366F1" />
            )}
          </View>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.analysisHeader}>
            <View style={styles.checkBadge}><Text style={styles.checkText}>검사</Text></View>
            <Text style={styles.analysisTitle}>러닝 분석 결과</Text>
          </View>
          <View style={styles.statsGrid}>
            {dummyStats.map((item, index) => (
              <View key={index} style={styles.statItem}>
                <Ionicons name={item.icon as any} size={22} color={item.isPace ? "#2e3d6e" : "#888"} />
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={[styles.statValue, item.isPace && styles.paceValue]}>{item.value}</Text>
                <Text style={styles.statUnit}>{item.unit}</Text>
              </View>
            ))}
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color="#FFF" />
              <Text style={[styles.buttonText, styles.whiteText]}>기록 공유하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={handleGoHome}>
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