import React, { FC, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { useHomeScreen, RunningMode } from "./useHomeScreen";
import { getStyles } from "./HomeScreen.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

// Ghost
import GhostSelectSheet from "./components/GhostSelectSheet";
import { fetchGhostProfiles } from "@/services/ghost/ghostService";
import type { GhostProfileDto } from "@/types/ghost";
import {useMe} from "@/hooks/useMe";

type HomeScreenProps = {
    navigation?: { navigate: (screen: string, params?: any) => void };
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
    const { me, loading } = useMe();
    const {
        activeMode,
        handleModeChange,
        isGoalPickerOpen,
        selectedGoal,
        goalOptions,
        toggleGoalPicker,
        handleSelectGoal,
        handleStartRun,
    } = useHomeScreen();

    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];
    const borderColor = colorScheme === "dark" ? "#333333" : "#E0E0E0";

    /** 티어 모드 상태 */
    const [isTierPickerOpen, setIsTierPickerOpen] = useState(false);
    const [tierDistance, setTierDistance] = useState<"5km" | "10km">("5km");
    const toggleTierPicker = () => setIsTierPickerOpen(prev => !prev);
    const handleSelectTierDistance = (distance: "5km" | "10km") => {
        setTierDistance(distance);
        setIsTierPickerOpen(false);
    };
    const handleStartTierRun = () => {
        console.log("티어 러닝 시작!", tierDistance);
    };

    /** 고스트 모드 상태 */
    const [ghostSheetOpen, setGhostSheetOpen] = useState(false);
    const [ghostLoading, setGhostLoading] = useState(false);
    const [ghostProfiles, setGhostProfiles] = useState<GhostProfileDto[]>([]);

    const loadGhostProfiles = async () => {
        setGhostLoading(true);
        try {
            const data = await fetchGhostProfiles();
            setGhostProfiles(data);
        } finally {
            setGhostLoading(false);
        }
    };

    const openGhostSheet = async () => {
        setGhostSheetOpen(true);
        if (!ghostLoading && ghostProfiles.length === 0) {
            await loadGhostProfiles();
        }
    };

    const handleSelectGhost = (gp: GhostProfileDto) => {
        setGhostSheetOpen(false);
        navigation?.navigate("GhostRun", { ghost: gp });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar
                onLeftPress={() => navigation?.navigate("Profile")}
                profileImageUrl={me?.profileImageUrl}
            />

            <View style={styles.content}>
                {/* 모드 탭 */}
                <View style={styles.tabContainer}>
                    <ModeTab mode="측정" activeMode={activeMode} onPress={handleModeChange} icon="timer-outline" scheme={colorScheme} />
                    <ModeTab mode="티어" activeMode={activeMode} onPress={handleModeChange} icon="ribbon-outline" scheme={colorScheme} />
                    <ModeTab mode="고스트" activeMode={activeMode} onPress={handleModeChange} icon="body-outline" scheme={colorScheme} />
                </View>

                {/* 지도 영역 */}
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

                {/* 하단 버튼 영역 */}
                <View style={styles.buttonSection}>
                    {/* ===================== 측정 모드 ===================== */}
                    {activeMode === "측정" && (
                        <>
                            <TouchableOpacity style={styles.blackButton} onPress={toggleGoalPicker}>
                                <Text style={styles.buttonTextMain}>
                                    {selectedGoal.value === 0 ? "목표 설정" : selectedGoal.label}
                                </Text>
                                <Ionicons
                                    name={isGoalPickerOpen ? "chevron-up" : "chevron-down"}
                                    size={22}
                                    color={colors.background}
                                />
                            </TouchableOpacity>

                            {isGoalPickerOpen && (
                                <View
                                    style={{
                                        backgroundColor: colors.card,
                                        borderRadius: 20,
                                        marginBottom: 10,
                                        overflow: "hidden",
                                        width: "100%",
                                        borderWidth: 1,
                                        borderColor,
                                    }}
                                >
                                    {goalOptions.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => handleSelectGoal(option)}
                                            style={{
                                                paddingVertical: 15,
                                                alignItems: "center",
                                                borderBottomWidth: index === goalOptions.length - 1 ? 0 : 1,
                                                borderBottomColor: borderColor,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    color: selectedGoal.value === option.value ? "#4A6EA9" : colors.text,
                                                }}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity style={[styles.blackButton, styles.startBtn]} onPress={handleStartRun}>
                                <View style={styles.buttonContentCentered}>
                                    <Ionicons name="play" size={24} color={colors.background} />
                                    <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>러닝 시작</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* ===================== 티어 모드 ===================== */}
                    {activeMode === "티어" && (
                        <>
                            <TouchableOpacity style={styles.blackButton} onPress={toggleTierPicker}>
                                <Text style={styles.buttonTextMain}>{tierDistance}</Text>
                                <Ionicons
                                    name={isTierPickerOpen ? "chevron-up" : "chevron-down"}
                                    size={22}
                                    color={colors.background}
                                />
                            </TouchableOpacity>

                            {isTierPickerOpen && (
                                <View
                                    style={{
                                        backgroundColor: colors.card,
                                        borderRadius: 20,
                                        marginBottom: 10,
                                        overflow: "hidden",
                                        width: "100%",
                                        borderWidth: 1,
                                        borderColor,
                                    }}
                                >
                                    {(["5km", "10km"] as const).map((dist) => (
                                        <TouchableOpacity
                                            key={dist}
                                            onPress={() => handleSelectTierDistance(dist)}
                                            style={{
                                                paddingVertical: 15,
                                                alignItems: "center",
                                                borderBottomWidth: dist === "10km" ? 0 : 1,
                                                borderBottomColor: borderColor,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    color: tierDistance === dist ? "#4A6EA9" : colors.text,
                                                }}
                                            >
                                                {dist}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity style={[styles.blackButton, styles.startBtn]} onPress={handleStartTierRun}>
                                <View style={styles.buttonContentCentered}>
                                    <Ionicons name="ribbon-outline" size={22} color={colors.background} />
                                    <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>티어 측정 시작</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* ===================== 고스트 모드 ===================== */}
                    {activeMode === "고스트" && (
                        <TouchableOpacity style={[styles.blackButton, styles.startBtn]} onPress={openGhostSheet}>
                            <View style={styles.buttonContentCentered}>
                                <Ionicons name="body-outline" size={22} color={colors.background} />
                                <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>고스트 선택</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Ghost Select Sheet */}
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