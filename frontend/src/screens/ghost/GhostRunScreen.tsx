// frontend/src/screens/ghost/GhostRunScreen.tsx

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useGhostRunScreen } from "./useGhostRunScreen";

const { width: W } = Dimensions.get("window");

type IoniconName =
    | "volume-high-outline"
    | "volume-mute-outline"
    | "pause"
    | "play"
    | "stop"
    | "analytics-outline"
    | "medal-outline"
    | "glasses-sharp";

export default function GhostRunScreen() {
    const scheme = (useColorScheme() ?? "light") as "light" | "dark";
    const base = Colors[scheme] as any;

    const colors = {
        background: "#F5F6F8",
        headerBg: "#FFFFFF",
        card: "#FFFFFF",
        text: base?.text ?? "#111111",
        text2: base?.text2 ?? "#222",
        primary: base?.primary ?? "#2F3A8F",
        border: "#E5E7EB",
        mutedText: base?.mutedText ?? base?.subtext ?? "#6B7280",
        danger: "#ff3b30",
    };

    // ✅ 음성 지원 ON/OFF 상태
    const [isSoundOn, setIsSoundOn] = useState(true);

    const { state, actions, utils } = useGhostRunScreen();
    const {
        isReady,
        countdown,
        isPaused,
        time,
        distanceM,
        currentPaceSec,
        ghostDistanceM,
        ghostTotalDistanceM,
        paceHistoryMin,
    } = state;

    const { pauseRun, resumeRun, stopRun } = actions;
    const { formatTime, formatPace, formatDiffBadge } = utils;

    const totalKm = ghostTotalDistanceM > 0 ? ghostTotalDistanceM / 1000 : 0;

    const youRatio =
        ghostTotalDistanceM > 0 ? Math.max(0, Math.min(1, distanceM / ghostTotalDistanceM)) : 0;
    const ghostRatio =
        ghostTotalDistanceM > 0
            ? Math.max(0, Math.min(1, ghostDistanceM / ghostTotalDistanceM))
            : 0;

    const youKmText = (distanceM / 1000).toFixed(2);
    const ghostKmText = (ghostDistanceM / 1000).toFixed(2);

    const midKm = totalKm > 0 ? totalKm / 2 : 0;
    const markRight = totalKm > 0 ? `${totalKm.toFixed(1)}km` : "-";
    const markMid = totalKm > 0 ? `${midKm.toFixed(1)}km` : "-";

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
        labelColor: (opacity = 1) =>
            scheme === "dark" ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: "0" },
    };

    const chartData = {
        labels: [],
        datasets: [
            {
                data: paceHistoryMin.length > 0 ? paceHistoryMin : [0],
                color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
            {isReady && (
                <View
                    pointerEvents="auto"
                    style={[s.countdownOverlay, { backgroundColor: colors.background }]}
                >
                    <Text style={[s.countdownText, { color: colors.primary }]}>
                        {countdown > 0 ? countdown : "GO!"}
                    </Text>
                    <Text style={[s.countdownLabel, { color: colors.text }]}>준비하세요!</Text>
                </View>
            )}

            <View style={[s.header, { backgroundColor: colors.headerBg, borderColor: colors.border }]}>
                <View style={[s.headerPill, { backgroundColor: colors.headerBg, borderColor: colors.border }]}>
                    <Ionicons name={"glasses-sharp" as IoniconName} size={16} color={colors.text} />
                    <Text style={[s.headerPillText, { color: colors.text }]}>고스트 모드</Text>
                </View>

                {/* ✅ 볼륨 토글 버튼 */}
                <TouchableOpacity
                    hitSlop={10}
                    activeOpacity={0.85}
                    style={[s.headerIconBtn, { backgroundColor: colors.headerBg, borderColor: colors.border }]}
                    onPress={() => setIsSoundOn((v) => !v)}
                >
                    <Ionicons
                        name={(isSoundOn ? "volume-high-outline" : "volume-mute-outline") as IoniconName}
                        size={22}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 120,
                    backgroundColor: colors.background,
                }}
            >
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={s.cardTopRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name={"medal-outline" as IoniconName} size={18} color={colors.text} />
                            <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>실시간 경쟁</Text>
                        </View>

                        <View style={[s.badge, { backgroundColor: colors.primary }]}>
                            <Text style={[s.badgeText, { color: "#fff" }]}>
                                {formatDiffBadge(ghostDistanceM - distanceM)}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 14 }}>
                        <View style={s.rankRow}>
                            <Text style={[s.rankLabel, { color: colors.mutedText }]}>🏆 고스트</Text>
                            <Text style={[s.rankValue, { color: colors.mutedText }]}>{ghostKmText} km</Text>
                        </View>

                        <View style={[s.gaugeTrack, { backgroundColor: "rgba(0,0,0,0.06)" }]}>
                            <View
                                style={[
                                    s.gaugeFill,
                                    {
                                        width: `${ghostRatio * 100}%`,
                                        backgroundColor: colors.primary,
                                        opacity: 0.55,
                                    },
                                ]}
                            />
                        </View>

                        <View style={[s.rankRow, { marginTop: 14 }]}>
                            <Text style={[s.rankLabel, { color: colors.mutedText }]}>👻 YOU</Text>
                            <Text style={[s.rankValue, { color: colors.mutedText }]}>{youKmText} km</Text>
                        </View>

                        <View style={[s.gaugeTrack, { backgroundColor: "rgba(0,0,0,0.06)" }]}>
                            <View
                                style={[
                                    s.gaugeFill,
                                    {
                                        width: `${youRatio * 100}%`,
                                        backgroundColor: colors.primary,
                                        opacity: 1,
                                    },
                                ]}
                            />
                        </View>

                        <View style={s.progressMarks}>
                            <Text style={[s.mark, { color: colors.mutedText }]}>0km</Text>
                            <Text style={[s.mark, { color: colors.mutedText }]}>{markMid}</Text>
                            <Text style={[s.mark, { color: colors.mutedText }]}>{markRight}</Text>
                        </View>
                    </View>
                </View>

                <View style={s.metricsRow}>
                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>시간</Text>
                        <Text style={[s.metricValue, { color: colors.text2 }]}>{formatTime(time)}</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border, marginLeft: 10 }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>거리</Text>
                        <Text style={[s.metricValue, { color: colors.text2 }]}>{youKmText}</Text>
                        <Text style={[s.metricUnit, { color: colors.mutedText }]}>km</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border, marginLeft: 10 }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>페이스</Text>
                        <Text style={[s.metricValue, { color: colors.text2 }]}>{formatPace(currentPaceSec)}</Text>
                        <Text style={[s.metricUnit, { color: colors.mutedText }]}>/km</Text>
                    </View>
                </View>

                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={"analytics-outline" as IoniconName} size={18} color={colors.text} />
                        <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>페이스 변화</Text>
                    </View>

                    <LineChart
                        data={chartData}
                        width={Math.min(W - 32 - 28, 420)}
                        height={140}
                        chartConfig={chartConfig}
                        bezier
                        style={{ marginTop: 12, borderRadius: 14 }}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLabels={false}
                        withHorizontalLabels={false}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                        <Text style={[s.small, { color: colors.mutedText }]}>시작</Text>
                        <Text style={[s.small, { color: colors.mutedText }]}>
                            현재 페이스: {formatPace(currentPaceSec)}/km
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[s.controls, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={[s.controlBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={isPaused ? resumeRun : pauseRun}
                    activeOpacity={0.85}
                >
                    <Ionicons name={(isPaused ? "play" : "pause") as IoniconName} size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[s.stopBtn, { backgroundColor: colors.danger, marginLeft: 14 }]}
                    onPress={stopRun}
                    activeOpacity={0.85}
                >
                    <Ionicons name={"stop" as IoniconName} size={22} color={"white"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const shadow = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
    default: {},
});

const shadow2 = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 3 },
    default: {},
});

const s = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 13,
        borderWidth: 1,
        ...shadow,
    },
    headerPillText: { fontWeight: "800", fontSize: 13, marginLeft: 6 },

    headerIconBtn: {
        width: 44,
        height: 40,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        ...shadow,
    },

    card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, ...shadow2 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontWeight: "900", fontSize: 14 },

    badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontWeight: "900", fontSize: 12 },

    rankRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    rankLabel: { fontSize: 12, fontWeight: "700" },
    rankValue: { fontSize: 12, fontWeight: "700" },

    gaugeTrack: {
        height: 10,
        borderRadius: 999,
        overflow: "hidden",
        marginTop: 10,
    },
    gaugeFill: { height: "100%", borderRadius: 999 },

    progressMarks: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    mark: { fontSize: 11, fontWeight: "700" },

    metricsRow: { flexDirection: "row", marginBottom: 12 },

    metric: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        ...shadow2,
    },

    metricLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
    metricValue: { fontSize: 20, fontWeight: "900", marginTop: 6, textAlign: "center" },
    metricUnit: { fontSize: 12, marginTop: 2, fontWeight: "600", textAlign: "center" },

    small: { fontSize: 11, fontWeight: "700" },

    controls: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 14,
        paddingBottom: 24,
        borderTopWidth: 2,
    },
    controlBtn: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        ...shadow2,
    },
    stopBtn: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        ...shadow2,
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        elevation: 999,
    },
    countdownText: { fontSize: 120, fontWeight: "900" },
    countdownLabel: { fontSize: 20, marginTop: 12 },
});
