import React, { FC, useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { useHomeScreen, RunningMode } from "./useHomeScreen";
import { getStyles } from "./HomeScreen.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

// ✅ Ghost related imports
import GhostSelectSheet from "./components/GhostSelectSheet";
import { fetchGhostProfiles } from "@/services/ghost/ghostService";
import type { GhostProfileDto } from "@/types/ghost";
import { DEFAULT_USER_ID } from "@/constants/env";

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
    // ✅ 1. Get common state and target setting logic from useHomeScreen hook
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

    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];

    // Border color adjustment for theme
    const borderColor = colorScheme === 'dark' ? '#333333' : '#E0E0E0';

    // ✅ 2. Ghost Mode local state and logic
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

    // Preload data when switching to Ghost Mode
    useEffect(() => {
        if (activeMode === "고스트") {
            loadGhostProfiles();
        }
    }, [activeMode, loadGhostProfiles]);

    const openGhostSheet = async () => {
        setGhostSheetOpen(true);
        if (ghostProfiles.length === 0 && !ghostLoading) {
            await loadGhostProfiles();
        }
    };

    const handleSelectGhost = (gp: GhostProfileDto) => {
        setGhostSheetOpen(false);
        navigation?.navigate("GhostRun", { ghost: gp });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar onLeftPress={() => navigation?.navigate("Profile")} />

            <View style={styles.content}>
                {/* 1. Mode Selection Tab */}
                <View style={styles.tabContainer}>
                    <ModeTab mode="측정" activeMode={activeMode} onPress={handleModeChange} icon="timer-outline" scheme={colorScheme} />
                    <ModeTab mode="티어" activeMode={activeMode} onPress={handleModeChange} icon="ribbon-outline" scheme={colorScheme} />
                    <ModeTab mode="고스트" activeMode={activeMode} onPress={handleModeChange} icon="body-outline" scheme={colorScheme} />
                </View>

                {/* 2. Map Area */}
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

                {/* 3. Bottom Button Section (Conditional Rendering) */}
                <View style={styles.buttonSection}>
                    {activeMode === "고스트" ? (
                        // ✅ A. Ghost Mode: "Select Ghost" Button
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
                        // ✅ B. Normal/Tier Mode: "Set Goal" & "Start Run" Buttons
                        <>
                            {/* (1) Goal Setting Button */}
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

                            {/* (2) Goal Selection Dropdown */}
                            {isGoalPickerOpen && (
                                <View style={{
                                    backgroundColor: colors.card,
                                    borderRadius: 20,
                                    marginBottom: 10,
                                    overflow: 'hidden',
                                    width: '100%',
                                    borderWidth: 1,
                                    borderColor: borderColor
                                }}>
                                    {goalOptions.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleSelectGoal(option)}
                                            style={{
                                                paddingVertical: 15,
                                                alignItems: 'center',
                                                borderBottomWidth: index === goalOptions.length - 1 ? 0 : 1,
                                                borderBottomColor: borderColor
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

                            {/* (3) Start Run Button */}
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
                        </>
                    )}
                </View>
            </View>

            {/* ✅ Ghost Select Bottom Sheet */}
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
