import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TopNavBarProps {
  onLeftPress?: () => void,
  onRightPress?: () => void,
}

export function TopNavBar({ onLeftPress, onRightPress }: TopNavBarProps) {
  return (
    <View style={styles.root}>
      {/* 1. 왼쪽 고스트 버튼 */}
      <TouchableOpacity style={styles.ghostButton} onPress={onLeftPress} activeOpacity={0.7}>
        <Text style={styles.ghostEmoji}>👻</Text>
      </TouchableOpacity>

      {/* 2. 중앙 로고 이미지 (절대 위치를 사용하여 화면 전체의 정중앙에 배치) */}
      <View style={styles.logoContainer} pointerEvents="none">
        <Image 
          // 제공해주신 로고 이미지 파일 경로로 수정하세요
          source={require('@/assets/runboo_logo_text.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* 3. 오른쪽 알림 버튼 */}
      <TouchableOpacity style={styles.bellButton} onPress={onRightPress} activeOpacity={0.7}>
        <View style={styles.iconWrapper}>
          <Ionicons name="notifications-outline" size={22} color="black" />
          <View style={styles.dot} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: 60, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#F1F3F5',
    borderBottomWidth: 1,
  },
  ghostButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#000',
    zIndex: 10,
  },
  ghostEmoji: { fontSize: 20 },
  logoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoImage: {
    width: 110, // 이미지 가로 크기 (로고 비율에 따라 조절)
    height: 30,  // 이미지 세로 크기
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
    zIndex: 10,
  },
  iconWrapper: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
});