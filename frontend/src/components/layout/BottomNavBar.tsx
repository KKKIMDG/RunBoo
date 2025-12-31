import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BottomNavBarProps {
  activeTab?: string;
  onTabPress?: (tabName: string) => void;
}

export function BottomNavBar({ activeTab = '홈', onTabPress }: BottomNavBarProps) {
  const tabs = [
    { name: '홈', icon: 'home', outline: 'home-outline' },
    { name: '코스', icon: 'map', outline: 'map-outline' },
    { name: '도전', icon: 'trophy', outline: 'trophy-outline' },
    { name: '통계', icon: 'stats-chart', outline: 'stats-chart-outline' },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity 
              key={tab.name} 
              style={styles.button} 
              onPress={() => onTabPress?.(tab.name)}
              activeOpacity={0.7}
            >
              {/* 활성화된 탭 상단의 검은색 선 */}
              {isActive && <View style={styles.activeBar} />}
              
              <Ionicons 
                name={isActive ? (tab.icon as any) : (tab.outline as any)} 
                size={24} 
                color={isActive ? "black" : "#868E96"} 
              />
              <Text style={[styles.tabText, isActive ? styles.activeText : styles.inactiveText]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',    // 화면에 고정
    bottom: 0,              // 맨 밑에 밀착
    left: 0,
    right: 0,
    width: '100%',
    height: 75,             // 아이폰 하단 홈 바 영역을 고려하여 높이 설정
    borderTopColor: '#E9ECEF',
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 5,       // 홈 인디케이터(Home Indicator) 여백 확보
    elevation: 20,           // 안드로이드 그림자
    shadowColor: '#000',     // iOS 그림자
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  button: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    height: '100%',
  },
  activeBar: { 
    position: 'absolute',
    top: -1,                // 상단 보더에 딱 붙게 설정
    width: 40, 
    height: 3, 
    borderRadius: 2, 
    backgroundColor: '#000',
  },
  tabText: { 
    fontSize: 10, 
    marginTop: 4 
  },
  activeText: { 
    color: '#000', 
    fontWeight: '700' 
  },
  inactiveText: { 
    color: '#868E96', 
    fontWeight: '400' 
  },
});