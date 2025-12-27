import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isLast?: boolean;
  type?: 'link' | 'switch' | 'text';
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

// ★ 흰색 동그라미 크기를 자유자재로 조절할 수 있는 커스텀 토글 컴포넌트
const CustomSmallSwitch = ({ active, onToggle }: { active: boolean; onToggle: (v: boolean) => void }) => {
  const moveAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(moveAnim, {
      toValue: active ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 14], // 동그라미가 움직일 거리 (트랙 너비에 맞춰 조절)
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onToggle(!active)}>
      <Animated.View style={[
        styles.switchTrack, 
        { backgroundColor: active ? '#2E3D6E' : '#E9ECEF' }
      ]}>
        <Animated.View style={[
          styles.switchThumb, 
          { transform: [{ translateX }] }
        ]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function SettingItem({
  icon, label, value, isLast, type = 'link', isEnabled = false, onToggle, onPress
}: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, !isLast && styles.borderBottom]} 
      onPress={onPress}
      disabled={type === 'text' || type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Ionicons name={icon} size={20} color="#868E96" style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.rightContent}>
        {type === 'switch' ? (
          <CustomSmallSwitch active={isEnabled} onToggle={onToggle || (() => {})} />
        ) : (
          <>
            {value && <Text style={styles.valueText}>{value}</Text>}
            {type === 'link' && <Ionicons name="chevron-forward" size={18} color="#ADB5BD" />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { marginRight: 12 },
  label: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginRight: 4,
  },
  // ★ 커스텀 스위치 트랙 (전체 배경)
  switchTrack: {
    width: 32, // 트랙 너비 축소
    height: 18, // 트랙 높이 축소
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  // ★ 커스텀 스위치 썸 (흰색 동그라미)
  switchThumb: {
    width: 13, // 흰색 동그라미 크기 대폭 축소
    height: 13,
    borderRadius: 6,
    backgroundColor: '#FFF',
    // 그림자를 약하게 주어 깔끔하게 처리
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});