import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/layout/TopNavBar';
import { useHomeScreen, RunningMode } from './useHomeScreen';
import { getStyles } from './HomeScreen.styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type HomeScreenProps = {
    navigation?: { navigate: (screen: string) => void };
    onLogout?: () => void;
};

const ModeTab: FC<{
    mode: RunningMode;
    activeMode: RunningMode;
    onPress: (mode: RunningMode) => void;
    icon: keyof typeof Ionicons.glyphMap;
    scheme: 'light' | 'dark';
}> = ({ mode, activeMode, onPress, icon, scheme }) => {
    const styles = getStyles(scheme);
    const colors = Colors[scheme];
    return (
        <TouchableOpacity
            style={[styles.tabButton, activeMode === mode && styles.activeTab]}
            onPress={() => onPress(mode)}
        >
            <View style={styles.tabItemContent}>
                <Ionicons name={icon} size={18} color={activeMode === mode ? colors.background : colors.icon} />
                <Text style={[styles.tabText, activeMode === mode && styles.activeTabText]}>{mode}</Text>
            </View>
        </TouchableOpacity>
    );
};

const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
    const {
        activeMode,
        handleModeChange,
        isGoalPickerOpen,
        selectedGoal,
        goalOptions,
        toggleGoalPicker,
        handleSelectGoal,
        handleStartRun
    } = useHomeScreen();

    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];

    // 테마에 맞는 경계선 색상 설정 (에러 수정 부분)
    const borderColor = colorScheme === 'dark' ? '#333333' : '#E0E0E0';

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar onLeftPress={() => navigation?.navigate('Profile')} />

            <View style={styles.content}>
                {/* 1. 모드 선택 탭 */}
                <View style={styles.tabContainer}>
                    <ModeTab mode="측정" activeMode={activeMode} onPress={handleModeChange} icon="timer-outline" scheme={colorScheme} />
                    <ModeTab mode="티어" activeMode={activeMode} onPress={handleModeChange} icon="ribbon-outline" scheme={colorScheme} />
                    <ModeTab mode="고스트" activeMode={activeMode} onPress={handleModeChange} icon="body-outline" scheme={colorScheme} />
                </View>

                {/* 2. 지도 영역 */}
                <View style={styles.mapBox}>
                    <View style={styles.mapContent}>
                        <Text style={styles.mapPlaceholderText}>카카오맵 영역</Text>
                    </View>
                    <TouchableOpacity style={styles.zoomBtn}>
                        <Ionicons name="eye-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.mapBottomRow}>
                        <View style={styles.userCount}>
                            <Ionicons name="people-outline" size={16} color={colors.primary} />
                            <Text style={styles.countText}>5</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.detailText}>자세히 보기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. 하단 버튼 섹션 */}
                <View style={styles.buttonSection}>

                    {/* (1) 목표 설정 버튼 */}
                    <TouchableOpacity
                        style={styles.blackButton}
                        onPress={toggleGoalPicker}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonTextMain}>
                            {selectedGoal.value === 0 ? "목표 설정" : selectedGoal.label}
                        </Text>
                        <Ionicons
                            name={isGoalPickerOpen ? "chevron-up" : "chevron-down"}
                            size={22}
                            color={colors.background}
                            style={styles.chevronIcon}
                        />
                    </TouchableOpacity>

                    {/* (2) 목표 선택 드롭다운 리스트 */}
                    {isGoalPickerOpen && (
                        <View style={{
                            backgroundColor: colors.card,
                            borderRadius: 20,
                            marginBottom: 10,
                            overflow: 'hidden',
                            width: '100%',
                            borderWidth: 1,
                            borderColor: borderColor // 여기에 수정된 색상 적용
                        }}>
                            {goalOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleSelectGoal(option)}
                                    style={{
                                        paddingVertical: 15,
                                        alignItems: 'center',
                                        // 마지막 항목은 밑줄 없음
                                        borderBottomWidth: index === goalOptions.length - 1 ? 0 : 1,
                                        borderBottomColor: borderColor // colors.border 대신 borderColor 사용
                                    }}
                                >
                                    <Text style={{
                                        color: selectedGoal.value === option.value ? '#4A6EA9' : colors.text,
                                        fontWeight: 'bold',
                                        fontSize: 16
                                    }}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* (3) 러닝 시작 버튼 */}
                    <TouchableOpacity
                        style={[styles.blackButton, styles.startBtn]}
                        onPress={handleStartRun}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContentCentered}>
                            <Ionicons name="play" size={24} color={colors.background} />
                            <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>러닝 시작</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
};

export default HomeScreen;