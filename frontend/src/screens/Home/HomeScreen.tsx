import React, { FC, useRef, useState, useEffect } from "react"; // ✅ useEffect 추가
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// API Service
import { updateBlindStatus } from "@/services/user/userService"; // ✅ 위에서 만든 함수 import (경로 확인 필요)

// Ghost
import GhostSelectSheet from "./components/GhostSelectSheet";
import { fetchGhostProfiles } from "@/services/ghost/ghostService";
import type { GhostProfileDto } from "@/types/ghost";

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

const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
    // ✅ 내 정보에서 userId 및 isBlind 정보 확보
    const { me } = useMe();

    // 1. MapView 제어를 위한 Ref 생성
    const mapRef = useRef<MapView>(null);

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

    // 🚀 부드러운 카메라 이동 함수
    const handleMoveToCurrentLocation = () => {
        if (location && mapRef.current) {
            mapRef.current.animateCamera({
                center: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
                zoom: 16,
                pitch: 0,
                heading: 0,
            }, { duration: 500 });
        } else {
            Alert.alert("알림", "현재 위치를 불러올 수 없습니다.");
        }
    };

    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const styles = getStyles(colorScheme);
    const colors = Colors[colorScheme];
    const borderColor = colorScheme === "dark" ? "#333333" : "#E0E0E0";

    /** 고스트 모드 상태 */
    const [ghostSheetOpen, setGhostSheetOpen] = useState(false);
    const [ghostLoading, setGhostLoading] = useState(false);
    const [ghostProfiles, setGhostProfiles] = useState<GhostProfileDto[]>([]);

    /** 👁️ 블라인드 모드 상태 (내 위치 숨기기) */
    const [isBlind, setIsBlind] = useState(false);

    /** ✅ [추가] 초기 상태 동기화: 앱 켜질 때 서버에 저장된 내 설정(me.isBlind) 불러오기 */
    useEffect(() => {
        if (me) {
            // 백엔드 UserMeResponseDto에 isBlind 필드가 있다고 가정
            setIsBlind(me.isBlind);
        }
    }, [me]);

    /** 👁️ [수정] 블라인드 모드 토글 핸들러 (API 연동) */
    const toggleBlindMode = async () => {
        const newValue = !isBlind;

        // 1. UI 먼저 변경 (반응 속도 향상)
        setIsBlind(newValue);

        try {
            // 2. 서버에 변경 요청 전송
            await updateBlindStatus(newValue);

        } catch (error) {
            // 4. 실패 시 원상복구
            console.error("블라인드 모드 변경 실패:", error);
            setIsBlind(!newValue);
            Alert.alert("오류", "설정 변경에 실패했습니다. 다시 시도해주세요.");
        }
    };

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
        navigation.navigate("GhostRun", {
            ghost: gp,
            userId: me?.userId,
        });
    };

    // ✅ 일반 러닝 시작 핸들러
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
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={{
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
                                    <View style={styles.markerContainer}>
                                        {runner.profileImageUrl ? (
                                            <Image
                                                source={{ uri: runner.profileImageUrl }}
                                                style={styles.markerImage}
                                            />
                                        ) : (
                                            <Ionicons name="person" size={24} color="#4A6EA9" />
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

                    {/* ✅ 블라인드(눈) 버튼: API 연동됨 */}
                    <TouchableOpacity
                        style={styles.zoomBtn}
                        onPress={toggleBlindMode}
                    >
                        <Ionicons
                            name={isBlind ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={isBlind ? "#999" : colors.text}
                        />
                    </TouchableOpacity>

                    {/* ✅ 내 위치로 이동 버튼: 구글 지도 스타일 */}
                    <TouchableOpacity
                        style={styles.myLocationBtn}
                        onPress={handleMoveToCurrentLocation}
                    >
                        <MaterialIcons name="my-location" size={24} color={colors.text} />
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