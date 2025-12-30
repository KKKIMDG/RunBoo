import React, { useState } from 'react';
import { styles } from './SettingsScreen.styles';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingItem from '@/components/setting/SettingItem'; // 경로 수정됨

export default function SettingsScreen({ navigation, onLogout }: any) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 섹션 1: 계정 및 보안 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={16} color="#3A4A98" />
            <Text style={styles.sectionTitle}>계정 및 보안</Text>
          </View>
          <View style={styles.card}>
            <SettingItem icon="person-outline" label="test123@example.com" type="text" />
            <SettingItem icon="key-outline" label="비밀번호 변경" />
            <SettingItem icon="link-outline" label="연결된 계정" isLast />
          </View>
        </View>

        {/* 섹션 2: 알림 및 소리 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={16} color="#FBC02D" />
            <Text style={styles.sectionTitle}>알림 및 소리</Text>
          </View>
          <View style={styles.card}>
            <SettingItem 
              icon="notifications-outline" label="푸시 알림" type="switch" 
              isEnabled={pushEnabled} onToggle={setPushEnabled} 
            />
            <SettingItem 
              icon="volume-medium-outline" label="음성 안내" type="switch" 
              isEnabled={voiceEnabled} onToggle={setVoiceEnabled} 
            />
            <SettingItem icon="musical-notes-outline" label="음성" value="남성" isLast />
          </View>
        </View>

        {/* 섹션 3: 화면 및 테마 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={16} color="#E91E63" />
            <Text style={styles.sectionTitle}>화면 및 테마</Text>
          </View>
          <View style={styles.card}>
            <SettingItem 
              icon="moon-outline" label="다크 모드" type="switch" 
              isEnabled={darkMode} onToggle={setDarkMode} 
            />
            <SettingItem icon="text-outline" label="폰트 크기" value="보통" isLast />
          </View>
        </View>

        {/* 섹션 4: 프라이버시 및 지원 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={16} color="#03A9F4" />
            <Text style={styles.sectionTitle}>프라이버시 및 지원</Text>
          </View>
          <View style={styles.card}>
            <SettingItem icon="location-outline" label="위치 권한" value="항상 허용" />
            <SettingItem icon="help-circle-outline" label="고객센터" />
            <SettingItem icon="information-circle-outline" label="버전 정보" value="v1.0.0" isLast type="text" />
          </View>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6467" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}