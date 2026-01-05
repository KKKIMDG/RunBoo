// frontend/src/screens/home/HomeScreen.tsx

import React, { FC, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";

// Components & Hooks
import { TopNavBar } from "@/components/layout/TopNavBar";
import { useHomeScreen, RunningMode } from "./useHomeScreen";
import { getStyles } from "./HomeScreen.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useNearbyRunners } from "@/hooks/useNearbyRunners";
import { useMe } from "@/hooks/useMe";

// Ghost
import GhostSelectSheet from "./components/GhostSelectSheet";
import { fetchGhostProfiles } from "@/services/ghost/ghostService";
import type { GhostProfileDto } from "@/types/ghost";

// ✅ records 조회
import { fetchMyRecords } from "@/services/record/recordsService";
import type { RecordDto } from "@/types/record";

type HomeScreenProps = {
    navigation: { navigate: (screen: string, params?: any) => void };
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
                <Text
                    style={[styles.tabText, activeMode === mode && styles.activeTabText]}
                >
                    {mode}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// 월요일 시작 (한국식)
function startOfWeekMondayLocal(now = new Date()) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0=일,1=월,...6=토
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    return d;
}

function addDaysLocal(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function computeSelfGhosts(userId: number, records: any[]): any[] {
    const list = (records ?? []).filter(
        (r) => (r?.distanceM ?? 0) > 0 && (r?.durationSec ?? 0) > 0
    );

    // 1) 직전 기록 = endedAt 기준 가장 최근 1개
    const lastOne =
        list.length === 0
            ? null
            : [...list].sort(
                (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
            )[0];

    // 2) ✅ 최고 기록 = TIER 모드 중 avgPace 가장 작은 1개
    const bestOne =
        list.length === 0
            ? null
            : [...list]
            .filter(
                (r) =>
                    r.mode === "TIER" &&
                    (r.avgPace ?? 0) > 0
            )
            .sort(
                (a, b) =>
                    (a.avgPace ?? Infinity) -
                    (b.avgPace ?? Infinity)
            )[0] ?? null;

    // 3) 이번 주 평균(가중 평균: 총시간/총거리)
    const today = new Date();
    const weekStart = startOfWeekMondayLocal(today); // 로컬 기준 월요일 00:00
    const weekEnd = addDaysLocal(weekStart, 7);

    const weekRecords = list.filter((r) => {
        const t = new Date(r.startedAt).getTime();
        return t >= weekStart.getTime() && t < weekEnd.getTime();
    });

    const weekTotalDistanceM = weekRecords.reduce((sum, r) => sum + (r.distanceM ?? 0), 0);
    const weekTotalDurationSec = weekRecords.reduce((sum, r) => sum + (r.durationSec ?? 0), 0);
    const weekAvgPaceSec =
        weekTotalDistanceM > 0 ? weekTotalDurationSec / (weekTotalDistanceM / 1000) : 0;

    const result: any[] = [];

    // ✅ SELF_BEST
    if (bestOne) {
        result.push({
            id: 0,
            userId,
            runRecordId: bestOne.id,
            type: "SELF_BEST",
            targetDistanceKm: bestOne.distanceM / 1000,
            avgPace: Math.floor(bestOne.avgPace),
            createdAt: bestOne.startedAt,
        });
    }

    // 직전 기록
    if (lastOne) {
        result.push({
            id: 0,
            userId,
            runRecordId: lastOne.id,
            type: "SELF_YESTERDAY",
            targetDistanceKm: lastOne.distanceM / 1000,
            avgPace: Math.floor(lastOne.avgPace),
            createdAt: lastOne.startedAt,
        });
    }

    // ✅ SELF_WEEKLY_AVG
    if (weekRecords.length > 0 && weekTotalDistanceM > 0) {
        result.push({
            id: 0,
            userId,
            runRecordId: 0,
            type: "SELF_WEEKLY_AVG",
            targetDistanceKm: weekTotalDistanceM / 1000,
            avgPace: Math.floor(weekAvgPaceSec),
            createdAt: weekStart.toISOString(),
        });
    }

    return result;
}

const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
    // ✅ 내 정보에서 userId 확보
    const { me } = useMe();

    // ✅ 주변 러너 데이터 가져오기
    const isFocused = useIsFocused();
    const { nearbyRunners } = useNearbyRunners(isFocused);

    // ✅ 홈 스크린 로직 가져오기
    const {
        activeMode,
        handleModeChange,

        // 측정 모드
        isGoalPickerOpen,
        selectedGoal,
        goalOptions,
        toggleGoalPicker,
        handleSelectGoal,

        // 티어 모드
        isTierPickerOpen,
        tierDistance,
        toggleTierPicker,
        handleSelectTierDistance,

        // 지도 관련
        location,
        handleOpenFullMap,
    } = useHomeScreen();

    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];
    const borderColor = colorScheme === "dark" ? "#333333" : "#E0E0E0";

    /** 고스트 모드 상태 */
    const [ghostSheetOpen, setGhostSheetOpen] = useState(false);
    const [ghostLoading, setGhostLoading] = useState(false);
    const [ghostProfiles, setGhostProfiles] = useState<GhostProfileDto[]>([]);

    // ✅ 고스트 데이터 로딩 로직 변경:
    // - 랭킹: 기존 ghost_profile(fetchGhostProfiles) 유지
    // - 내 기록: run_records(fetchMyRecords) 기반으로 프론트 계산해서 SELF_* 생성
    const loadGhostProfiles = async () => {
        if (!me?.userId) {
            Alert.alert("알림", "사용자 정보를 불러오는 중입니다.");
            return;
        }

        setGhostLoading(true);
        try {
            // 1) 랭킹은 기존대로 ghost_profile에서 유지
            const ghostProfileData = await fetchGhostProfiles();

            const rankingOnly = (ghostProfileData ?? []).filter((gp) => {
                const t = String(gp?.type ?? "").toUpperCase();
                return t.startsWith("RANKING_");
            });

            // 2) 내 기록은 run_records 전부 조회 후 프론트에서 계산
            const myRecords = await fetchMyRecords();
            const selfComputed = computeSelfGhosts(me.userId, myRecords);

            // 3) 합쳐서 시트에 제공 (SELF_* + RANKING_*)
            setGhostProfiles([...selfComputed, ...rankingOnly]);
        } finally {
            setGhostLoading(false);
        }
    };

    // ✅ “고스트 선택” 누를 때마다 최신 기록으로 다시 계산하길 원했으니까
    // 매번 loadGhostProfiles() 호출
    const openGhostSheet = async () => {
        setGhostSheetOpen(true);
        await loadGhostProfiles();
    };

    const handleSelectGhost = (gp: GhostProfileDto) => {
        setGhostSheetOpen(false);
        // ✅ 고스트 모드도 userId 전달
        navigation.navigate("GhostRun", {
            ghost: gp,
            userId: me?.userId,
        });
    };

    // ✅ [수정] 일반 러닝 시작 핸들러: userId를 반드시 포함
    const onStartNormalRun = () => {
        if (!me?.userId) {
            Alert.alert("알림", "사용자 정보를 불러오는 중입니다.");
            return;
        }
        navigation.navigate("Running", {
            userId: me.userId,
            targetDistance: selectedGoal.value,
        });
    };

    // ✅ [수정] 티어 러닝 시작 핸들러: userId를 반드시 포함
    const onStartTierRun = () => {
        if (!me?.userId) {
            Alert.alert("알림", "사용자 정보를 불러오는 중입니다.");
            return;
        }
        navigation.navigate("TierRunning", {
            userId: me.userId,
            targetDistance: tierDistance === "5km" ? 5000 : 10000,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TopNavBar
                onLeftPress={() => navigation.navigate("Profile")}
                profileImageUrl={me?.profileImageUrl}
            />

            <View style={styles.content}>
                {/* 모드 탭 */}
                <View style={styles.tabContainer}>
                    <ModeTab
                        mode="측정"
                        activeMode={activeMode}
                        onPress={handleModeChange}
                        icon="timer-outline"
                        scheme={colorScheme}
                    />
                    <ModeTab
                        mode="티어"
                        activeMode={activeMode}
                        onPress={handleModeChange}
                        icon="ribbon-outline"
                        scheme={colorScheme}
                    />
                    <ModeTab
                        mode="고스트"
                        activeMode={activeMode}
                        onPress={handleModeChange}
                        icon="body-outline"
                        scheme={colorScheme}
                    />
                </View>

                {/* 지도 영역 */}
                <View style={styles.mapBox}>
                    {location ? (
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            region={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                        >
                            {nearbyRunners.map((runner) => (
                                <Marker
                                    key={runner.userId}
                                    coordinate={{
                                        latitude: runner.latitude,
                                        longitude: runner.longitude,
                                    }}
                                    title={runner.nickname}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            backgroundColor: "white",
                                            borderWidth: 2,
                                            borderColor: "#4A6EA9",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            shadowColor: "#000",
                                            shadowOpacity: 0.3,
                                            elevation: 4,
                                        }}
                                    >
                                        {runner.profileImageUrl ? (
                                            <Image
                                                source={{ uri: runner.profileImageUrl }}
                                                style={{ width: 32, height: 32, borderRadius: 16 }}
                                            />
                                        ) : (
                                            <Ionicons name="person" size={20} color="#4A6EA9" />
                                        )}
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    ) : (
                        <View style={styles.mapContent}>
                            <Text style={styles.mapPlaceholderText}>
                                위치를 불러오는 중...
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.zoomBtn}>
                        <Ionicons name="eye-outline" size={22} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.mapBottomRow}>
                        <View style={styles.mapBottomButton}>
                            <Ionicons
                                name="people-outline"
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.countText}>{nearbyRunners.length}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.mapBottomButton}
                            onPress={handleOpenFullMap}
                        >
                            <Text style={styles.detailText}>자세히 보기</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 하단 버튼 영역 */}
                <View style={styles.buttonSection}>
                    {activeMode === "측정" && (
                        <>
                            <TouchableOpacity
                                style={styles.blackButton}
                                onPress={toggleGoalPicker}
                            >
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
                                                borderBottomWidth:
                                                    index === goalOptions.length - 1 ? 0 : 1,
                                                borderBottomColor: borderColor,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    color:
                                                        selectedGoal.value === option.value
                                                            ? "#4A6EA9"
                                                            : colors.text,
                                                }}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.blackButton, styles.startBtn]}
                                onPress={onStartNormalRun}
                            >
                                <View style={styles.buttonContentCentered}>
                                    <Ionicons name="play" size={24} color={colors.background} />
                                    <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>
                                        러닝 시작
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {activeMode === "티어" && (
                        <>
                            <TouchableOpacity
                                style={styles.blackButton}
                                onPress={toggleTierPicker}
                            >
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
                                                    color:
                                                        tierDistance === dist ? "#4A6EA9" : colors.text,
                                                }}
                                            >
                                                {dist}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.blackButton, styles.startBtn]}
                                onPress={onStartTierRun}
                            >
                                <View style={styles.buttonContentCentered}>
                                    <Ionicons
                                        name="ribbon-outline"
                                        size={22}
                                        color={colors.background}
                                    />
                                    <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>
                                        티어 측정 시작
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}

                    {activeMode === "고스트" && (
                        <TouchableOpacity
                            style={[styles.blackButton, styles.startBtn]}
                            onPress={openGhostSheet}
                        >
                            <View style={styles.buttonContentCentered}>
                                <Ionicons
                                    name="body-outline"
                                    size={22}
                                    color={colors.background}
                                />
                                <Text style={[styles.buttonTextMain, { marginLeft: 8 }]}>
                                    고스트 선택
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

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
