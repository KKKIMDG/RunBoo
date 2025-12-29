import React, { FC, useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { useHomeScreen, RunningMode } from "./useHomeScreen";
import { getStyles } from "./HomeScreen.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import GhostSelectSheet from "./components/GhostSelectSheet";
import { fetchGhostProfiles } from "@/services/ghost/ghostService";
import type { GhostProfileDto } from "@/types/ghost";
import { DEFAULT_USER_ID } from "@/constants/env"; // ✅ records/stats에서 쓰던 상수

type HomeScreenProps = {
    navigation?: { navigate: (screen: string, params?: any) => void };
    onLogout?: () => void;
};

const ModeTab: FC<{
    mode: RunningMode;
    activeMode: RunningMode;
    onPress: (mode: RunningMode) => void;
    icon: keyof typeof Ionicons.glyphMap;
    scheme: "light" | "dark";
}> = ({ mode, activeMode, onPress, icon, scheme }) => {
    const styles = getStyles(scheme);
    const colors = Colors[scheme];
    return (
        <TouchableOpacity
            style={[styles.tabButton, activeMode === mode && styles.activeTab]}
            onPress={() => onPress(mode)}
        >
            <View style={styles.tabItemContent}>
                <Ionicons
                    name={icon}
                    size={18}
                    color={activeMode === mode ? colors.background : colors.icon}
                />
                <Text style={[styles.tabText, activeMode === mode && styles.activeTabText]}>
                    {mode}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
    const { activeMode, handleModeChange } = useHomeScreen();
    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];

    // ✅ 고스트 선택 모달/데이터 상태
    const [ghostSheetOpen, setGhostSheetOpen] = useState(false);
    const [ghostLoading, setGhostLoading] = useState(false);
    const [ghostProfiles, setGhostProfiles] = useState<GhostProfileDto[]>([]);
    const userId = DEFAULT_USER_ID;

    const loadGhostProfiles = useCallback(async () => {
        setGhostLoading(true);
        try {
            const data = await fetchGhostProfiles(userId);
            setGhostProfiles(data);
        } finally {
            setGhostLoading(false);
        }
    }, [userId]);

    // ✅ 고스트 모드로 들어왔을 때 미리 로드(UX 좋아짐)
    useEffect(() => {
        if (activeMode === "고스트") {
            loadGhostProfiles();
        }
    }, [activeMode, loadGhostProfiles]);

    const openGhostSheet = async () => {
        setGhostSheetOpen(true);
        // 이미 로딩된 경우엔 재요청 안 해도 되지만,
        // “완벽 동작” 우선이라 여기서 한번 더 보장해줌
        if (ghostProfiles.length === 0 && !ghostLoading) {
            await loadGhostProfiles();
        }
    };

    const handleSelectGhost = (gp: GhostProfileDto) => {
        setGhostSheetOpen(false);
        // ✅ 고스트 측정 화면으로 이동 (React Navigation 기준)
        navigation?.navigate("GhostRun", { ghost: gp });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar onLeftPress={() => navigation?.navigate("Profile")} />

            <View style={styles.content}>
                {/* 1. 모드 선택 탭 */}
                <View style={styles.tabContainer}>
                    <ModeTab mode="측정" activeMode={activeMode} onPress={handleModeChange} icon="timer-outline" scheme={colorScheme} />
                    <ModeTab mode="티어" activeMode={activeMode} onPress={handleModeChange} icon="ribbon-outline" scheme={colorScheme} />
                    <ModeTab mode="고스트" activeMode={activeMode} onPress={handleModeChange} icon="body-outline" scheme={colorScheme} />
                </View>

                {/* 2. 지도 영역(항상 유지) */}
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
                    {activeMode === "고스트" ? (
                        // ✅ 고스트 모드일 때: “고스트 선택” 버튼 하나로 교체
                        <TouchableOpacity
                            style={[styles.blackButton, styles.startBtn]}
                            onPress={openGhostSheet}
                            activeOpacity={0.9}
                        >
                            <View style={styles.buttonContentCentered}>
                                <Ionicons name="body-outline" size={22} color={colors.background} />
                                <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>고스트 선택</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        // ✅ 기존(측정/티어) 버튼 2개 유지
                        <>
                            <TouchableOpacity style={styles.blackButton}>
                                <Text style={styles.buttonTextMain}>목표 설정</Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={22}
                                    color={colors.background}
                                    style={styles.chevronIcon}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.blackButton, styles.startBtn]}>
                                <View style={styles.buttonContentCentered}>
                                    <Ionicons name="play" size={24} color={colors.background} />
                                    <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>러닝 시작</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* ✅ 고스트 선택 바텀시트 */}
            <GhostSelectSheet
                visible={ghostSheetOpen}
                scheme={colorScheme}
                loading={ghostLoading}
                data={ghostProfiles}
                onClose={() => setGhostSheetOpen(false)}
                onSelect={handleSelectGhost}
                onRefresh={loadGhostProfiles}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;
