import React from 'react';
import { styles } from './SettingsScreen.styles';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingItem from '@/components/setting/SettingItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from './useSettings';
import { useUserMe } from '@/contexts/UserMeContext';

export default function SettingsScreen({ navigation, onLogout }: any) {
  const { settings, update, loading } = useSettings();
  const { userMe } = useUserMe();

  if (!userMe) return null;
  if (loading || !settings) {
    return null; // 또는 로딩 UI
  }
  return (
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>설정</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* 계정 및 보안 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-outline" size={16} color="#3A4A98" />
              <Text style={styles.sectionTitle}>계정 및 보안</Text>
            </View>
            <View style={styles.card}>
              <SettingItem
                  icon="person-outline"
                  label={userMe.email}
                  type="text"
              />
              <SettingItem
                  icon="key-outline"
                  label="비밀번호 변경"
                  onPress={() => navigation.navigate('ChangePassword')}
              />
              <SettingItem
                  icon="link-outline"
                  label="연결된 계정"
                  onPress={() => navigation.navigate('LinkedAccounts')}
                  isLast
              />
            </View>
          </View>

          {/* 알림 및 소리 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications-outline" size={16} color="#FBC02D" />
              <Text style={styles.sectionTitle}>알림 및 소리</Text>
            </View>
            <View style={styles.card}>
              <SettingItem
                  icon="notifications-outline"
                  label="푸시 알림"
                  type="switch"
                  isEnabled={settings.pushEnabled}
                  onToggle={(v) => update('pushEnabled', v)}
              />

              <SettingItem
                  icon="volume-medium-outline"
                  label="음성 안내"
                  type="switch"
                  isEnabled={settings.voiceEnabled}
                  onToggle={(v) => update('voiceEnabled', v)}
              />

              <SettingItem
                  icon="musical-notes-outline"
                  label="음성"
                  type="select"
                  value={settings.voiceType === 'MALE' ? '남성' : '여성'}
                  options={[
                    { label: '남성', value: 'MALE' },
                    { label: '여성', value: 'FEMALE' },
                  ]}
                  onSelect={(v) => update('voiceType', v)}
                  isLast
              />
            </View>
          </View>

          {/* 화면 및 테마 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette-outline" size={16} color="#E91E63" />
              <Text style={styles.sectionTitle}>화면 및 테마</Text>
            </View>
            <View style={styles.card}>
              <SettingItem
                  icon="moon-outline"
                  label="테마"
                  type="select"
                  value={
                    settings.themeMode === 'SYSTEM'
                        ? '시스템'
                        : settings.themeMode === 'DARK'
                            ? '다크'
                            : '라이트'
                  }
                  options={[
                    { label: '시스템', value: 'SYSTEM' },
                    { label: '라이트', value: 'LIGHT' },
                    { label: '다크', value: 'DARK' },
                  ]}
                  onSelect={(v) => update('themeMode', v)}
              />

              <SettingItem
                  icon="text-outline"
                  label="폰트 크기"
                  type="select"
                  value={
                    settings.fontSize === 'SMALL'
                        ? '작게'
                        : settings.fontSize === 'LARGE'
                            ? '크게'
                            : '보통'
                  }
                  options={[
                    { label: '작게', value: 'SMALL' },
                    { label: '보통', value: 'NORMAL' },
                    { label: '크게', value: 'LARGE' },
                  ]}
                  onSelect={(v) => update('fontSize', v)}
                  isLast
              />
            </View>
          </View>

          {/* 프라이버시 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="eye-outline" size={16} color="#03A9F4" />
              <Text style={styles.sectionTitle}>프라이버시</Text>
            </View>
            <View style={styles.card}>
              <SettingItem
                  icon="location-outline"
                  label="위치 권한"
                  type="select"
                  value="항상 허용"
                  options={[
                    { label: '항상 허용', value: 'ALWAYS' },
                    { label: '앱 사용 중', value: 'WHILE_USING' },
                    { label: '허용 안 함', value: 'DENIED' },
                  ]}
                  onSelect={() => {
                    // 👉 실제 OS 권한 화면으로 이동
                  }}
                  isLast
              />
            </View>
          </View>

          {/* 로그아웃 */}
          <TouchableOpacity
              style={styles.logoutButton}
              onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF6467" />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
  );
}
