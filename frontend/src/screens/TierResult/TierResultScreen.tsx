import React, { useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import RunningStatsSummary from "@/components/RunningStatsSummary";
import { styles } from "./TierResult.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TIER_THEMES } from "./TierResult.constants";
import { TIER_IMAGES } from "@/constants/TierImages";
import { useTierResult } from "./useTierResult";

type TierResultScreenProps = {
    navigation: any;
    route: {
        params?: {
            stats?: {
                distance: string; // ex) "5.23"
                time: string;     // ex) "32:15"
                pace: string;     // ex) "6'10\""
            };
        };
    };
};

const TierResultScreen = ({ navigation, route }: TierResultScreenProps) => {
    // 📸 캡처 영역 Ref
    const viewRef = useRef<View>(null);
    const colorScheme = useColorScheme() ?? "light";

    // ✅ RunResultScreen에서 전달된 표시용 기록 값
    const { stats } = route.params ?? {};

    // ✅ 티어 관련 데이터 및 공유 로직
    const { tierName, tierData, loading, error, handleShare } =
        useTierResult(navigation, route, viewRef);

    // 로딩 상태
    if (loading) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color="#3A4A98" />
            </View>
        );
    }

    // 에러 상태
    if (error || !tierName) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <Text style={{ color: "#999", marginBottom: 20 }}>
                    데이터를 불러올 수 없습니다.
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: "#3A4A98", fontWeight: "bold" }}>뒤로가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const theme = TIER_THEMES[tierName];
    const tierImage = TIER_IMAGES[tierName];

    return (
        <View style={styles.container}>
            {/* 📸 캡처 영역 시작 */}
            <View
                ref={viewRef}
                collapsable={false}
                style={{ flex: 1, backgroundColor: theme.colors[0] }}
            >
                {/* 배경 그라데이션 */}
                <LinearGradient colors={theme.colors} style={styles.gradient} />
                <LinearGradient
                    colors={["rgba(255,255,255,0.7)", "transparent"]}
                    style={styles.shineGradient}
                    pointerEvents="none"
                />

                {/* 상단: 티어 결과 영역 */}
                <View style={styles.topSection}>
                    <View
                        style={[
                            styles.tierLabelBox,
                            { backgroundColor: theme.point },
                        ]}
                    >
                        <Text style={styles.tierTitle}>티어 측정 결과</Text>
                    </View>

                    <Text style={styles.tierName}>{theme.label}</Text>

                    <View style={styles.ghostContainer}>
                        <View style={styles.tierImageGlow} />
                        {tierImage && (
                            <Image source={tierImage} style={styles.tierImage} />
                        )}
                    </View>
                </View>

                {/* 하단: 기록 분석 영역 */}
                <View style={styles.bottomSheet}>
                    <View style={styles.analysisHeader}>
                        <View
                            style={[
                                styles.checkBadge,
                                { backgroundColor: theme.colors[1] },
                            ]}
                        >
                            <Text style={styles.checkText}>CHECK</Text>
                        </View>
                        <Text style={styles.analysisTitle}>러닝 측정 분석</Text>
                    </View>

                    {/* ✅ 프론트에서 계산된 값 그대로 출력 */}
                    <RunningStatsSummary
                        distance={stats?.distance ?? "-"}
                        time={stats?.time ?? "-"}
                        pace={stats?.pace ?? "-"}
                    />
                </View>
            </View>
            {/* 📸 캡처 영역 끝 */}

            {/* 🚫 캡처 제외 영역 */}
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.shareButton,
                        { backgroundColor: theme.colors[1] },
                    ]}
                    onPress={handleShare}
                >
                    <Ionicons name="share-social" size={20} color="#FFF" />
                    <Text
                        style={[
                            styles.buttonText,
                            styles.whiteText,
                            { marginLeft: 8 },
                        ]}
                    >
                        기록 자랑하기
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("MainTabs")}
                >
                    <Ionicons
                        name="home-outline"
                        size={20}
                        color={colorScheme === "dark" ? "#FFF" : "#000"}
                    />
                    <Text style={[styles.buttonText, { marginLeft: 8 }]}>
                        홈으로
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TierResultScreen;