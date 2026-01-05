import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './SettingsScreen.styles';
import SettingItem from '@/components/setting/SettingItem';
import { useSettings } from './useSettings';
import { useUserMe } from '@/contexts/UserMeContext';

export default function SettingsScreen({ navigation, onLogout }: any) {
    const { settings, update, loading } = useSettings();
    const { userMe } = useUserMe();

    const isLocal = userMe?.provider === 'LOCAL';

    // 어떤 select가 열려 있는지 (화살표용)
    const [openSelectKey, setOpenSelectKey] = useState<string | null>(null);

    // 실제 드랍다운 데이터
    const [dropdown, setDropdown] = useState<null | {
        x: number;
        y: number;
        width: number;
        height: number;
        options: { label: string; value: any }[];
        onSelect: (v: any) => void;
    }>(null);

    if (!userMe || loading || !settings) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ================= 헤더 ================= */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>설정</Text>
            </View>

            {/* ================= 드랍다운 ================= */}
            {dropdown && (
                <Modal transparent animationType="fade">
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => {
                            setDropdown(null);
                            setOpenSelectKey(null);
                        }}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            top: dropdown.y + dropdown.height,
                            right: 20,
                            backgroundColor: '#FFF',
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: '#E9ECEF',
                            elevation: 6,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                            minWidth: 160,
                        }}
                    >
                        {dropdown.options.map(opt => (
                            <TouchableOpacity
                                key={String(opt.value)}
                                style={{
                                    height: 48,
                                    justifyContent: 'center',
                                    paddingHorizontal: 18,
                                }}
                                onPress={() => {
                                    dropdown.onSelect(opt.value);
                                    setDropdown(null);
                                    setOpenSelectKey(null);
                                }}
                            >
                                <Text style={{ fontSize: 15, color: '#1F2937' }}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Modal>
            )}

            {/* ================= 본문 ================= */}
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

                        {isLocal ? (
                            <SettingItem
                                icon="key-outline"
                                label="비밀번호 변경"
                                onPress={() => navigation.navigate('VerifyCurrentPassword')}
                                isLast
                            />
                        ) : (
                            <SettingItem
                                icon="link-outline"
                                label={
                                    userMe.provider === 'KAKAO'
                                        ? '카카오 계정과 연동 중'
                                        : 'Google 계정과 연동 중'
                                }
                                type="text"
                                isLast
                            />
                        )}
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
                            onOpenSelect={setDropdown}
                            isOpen={openSelectKey === 'voiceType'}
                            onToggleOpen={() =>
                                setOpenSelectKey(prev =>
                                    prev === 'voiceType' ? null : 'voiceType'
                                )
                            }
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
                            onOpenSelect={setDropdown}
                            isOpen={openSelectKey === 'themeMode'}
                            onToggleOpen={() =>
                                setOpenSelectKey(prev =>
                                    prev === 'themeMode' ? null : 'themeMode'
                                )
                            }
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
                            onOpenSelect={setDropdown}
                            isOpen={openSelectKey === 'fontSize'}
                            onToggleOpen={() =>
                                setOpenSelectKey(prev =>
                                    prev === 'fontSize' ? null : 'fontSize'
                                )
                            }
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
                            onSelect={() => {}}
                            onOpenSelect={setDropdown}
                            isOpen={openSelectKey === 'location'}
                            onToggleOpen={() =>
                                setOpenSelectKey(prev =>
                                    prev === 'location' ? null : 'location'
                                )
                            }
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

                {/* 여백 */}
                <View style={{ height: 32 }} />

                {/* 계정 탈퇴 */}
                <TouchableOpacity
                    style={{ marginTop: 12, alignSelf: 'center' }}
                    onPress={() => navigation.navigate('Withdraw')}
                >
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#9CA3AF',
                            textDecorationLine: 'underline',
                        }}
                    >
                        계정 탈퇴하기
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
