// frontend/src/screens/ghost/GhostRunScreen.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useGhostRunScreen } from "./useGhostRunScreen";

type IoniconName =
    | "body-outline"
    | "volume-high-outline"
    | "pause"
    | "play"
    | "stop";

export default function GhostRunScreen() {
    const scheme = (useColorScheme() ?? "light") as "light" | "dark";

    const base = Colors[scheme] as any;
    const colors = {
        background: base?.background ?? "#FFFFFF",
        text: base?.text ?? "#111111",
        primary: base?.primary ?? "#2F3A8F",
        card: base?.card ?? base?.surface ?? "#F3F4F6",
        border: base?.border ?? "#E5E7EB",
        mutedText: base?.mutedText ?? "#6B7280",
        danger: "#ff3b30",
    };

    const { state, actions, utils } = useGhostRunScreen();

    const {
        isReady,
        countdown,
        isPaused,
        time,
        distanceM,
        currentPaceSec,
        ghostDistanceM,
        diffM,
        progress,
    } = state;

    const { pauseRun, resumeRun, stopRun } = actions;
    const { formatTime, formatPace, formatDiffBadge } = utils;

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
            {/* ✅ 카운트다운 오버레이: 배경을 불투명으로 깔아서 완전히 가림 */}
            {isReady && (
                <View
                    pointerEvents="auto"
                    style={[
                        s.countdownOverlay,
                        {
                            backgroundColor: colors.background, // ✅ 핵심
                        },
                    ]}
                >
                    <Text style={[s.countdownText, { color: colors.primary }]}>
                        {countdown > 0 ? countdown : "GO!"}
                    </Text>
                    <Text style={[s.countdownLabel, { color: colors.text }]}>고스트와 경쟁 시작</Text>
                </View>
            )}

            {/* Header */}
            <View style={[s.header, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <View style={s.headerCenter}>
                    <View style={[s.pill, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <Ionicons name={"body-outline" as IoniconName} size={16} color={colors.text} />
                        <Text style={[s.pillText, { color: colors.text }]}>고스트 모드</Text>
                    </View>
                </View>

                <Ionicons name={"volume-high-outline" as IoniconName} size={22} color={colors.text} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                {/* 경쟁 카드 */}
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={s.cardTopRow}>
                        <Text style={[s.cardTitle, { color: colors.text }]}>실시간 경쟁</Text>
                        <View style={[s.badge, { backgroundColor: colors.primary }]}>
                            <Text style={{ color: "#fff", fontWeight: "900" }}>
                                {formatDiffBadge(diffM)}
                            </Text>
                        </View>
                    </View>

                    <View style={s.rankRow}>
                        <Text style={{ color: colors.mutedText }}>👻 고스트</Text>
                        <Text style={{ color: colors.mutedText }}>
                            {(ghostDistanceM / 1000).toFixed(2)} km
                        </Text>
                    </View>

                    <View style={s.rankRow}>
                        <Text style={{ color: colors.mutedText }}>🏃 YOU</Text>
                        <Text style={{ color: colors.mutedText }}>
                            {(distanceM / 1000).toFixed(2)} km
                        </Text>
                    </View>

                    <View style={[s.progressBar, { borderColor: colors.border }]}>
                        <View
                            style={[
                                s.progressFill,
                                { width: `${progress * 100}%`, backgroundColor: colors.primary },
                            ]}
                        />
                    </View>
                </View>

                {/* 지표 */}
                <View style={s.metricsRow}>
                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={{ color: colors.mutedText }}>시간</Text>
                        <Text style={[s.metricValue, { color: colors.text }]}>{formatTime(time)}</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={{ color: colors.mutedText }}>거리</Text>
                        <Text style={[s.metricValue, { color: colors.text }]}>
                            {(distanceM / 1000).toFixed(2)} km
                        </Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={{ color: colors.mutedText }}>페이스</Text>
                        <Text style={[s.metricValue, { color: colors.text }]}>
                            {formatPace(currentPaceSec)}/km
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 컨트롤 */}
            <View style={[s.controls, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={[s.controlBtn, { borderColor: colors.border }]}
                    onPress={isPaused ? resumeRun : pauseRun}
                >
                    <Ionicons
                        name={(isPaused ? "play" : "pause") as IoniconName}
                        size={26}
                        color={colors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={[s.stopBtn, { backgroundColor: colors.danger }]} onPress={stopRun}>
                    <Ionicons name={"stop" as IoniconName} size={26} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "center",
    },
    headerCenter: { alignItems: "center" },

    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
    },
    pillText: { marginLeft: 6, fontWeight: "900" },

    card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between" },
    cardTitle: { fontSize: 14, fontWeight: "900" },

    badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },

    rankRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },

    progressBar: {
        height: 10,
        borderRadius: 999,
        borderWidth: 1,
        marginTop: 12,
        overflow: "hidden",
    },
    progressFill: { height: "100%" },

    metricsRow: { flexDirection: "row", marginTop: 12 },
    metric: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 4,
    },
    metricValue: { fontSize: 18, fontWeight: "900", marginTop: 6 },

    controls: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 16,
    },
    controlBtn: {
        width: 64,
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    stopBtn: {
        width: 74,
        height: 54,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },

    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        elevation: 999, // android에서 확실히 위로
    },
    countdownText: { fontSize: 120, fontWeight: "900" },
    countdownLabel: { fontSize: 20, marginTop: 12 },
});
