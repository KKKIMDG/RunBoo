import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { GhostProfileDto } from "@/types/ghost";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatPaceSecToText, formatKm } from "@/screens/ghost/format";

type Props = {
    route?: { params?: { ghost: GhostProfileDto } };
    navigation?: { goBack: () => void };
};

// ✅ 아이콘 타입 이슈 방지(필요한 것만 명시)
type IoniconName =
    | "chevron-back"
    | "body-outline"
    | "volume-high-outline"
    | "medal-outline"
    | "analytics-outline"
    | "trophy-outline"
    | "pause"
    | "stop";

export default function GhostRunScreen({ route, navigation }: Props) {
    const scheme = (useColorScheme() ?? "light") as "light" | "dark";

    // ✅ Colors에 card/border/mutedText가 없어도 안 터지게 fallback
    const base = Colors[scheme] as any;
    const colors = {
        background: base?.background ?? "#FFFFFF",
        text: base?.text ?? "#111111",
        primary: base?.primary ?? "#2F3A8F",
        card: base?.card ?? base?.surface ?? "#F3F4F6",
        border: base?.border ?? "#E5E7EB",
        mutedText: base?.mutedText ?? base?.subtext ?? "#6B7280",
    };

    const ghost = route?.params?.ghost;

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
            <View style={[s.header, { borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={10}>
                    <Ionicons name={"chevron-back" as IoniconName} size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={s.headerCenter}>
                    <View style={[s.pill, { borderColor: colors.border, backgroundColor: colors.card }]}>
                        <Ionicons name={"body-outline" as IoniconName} size={16} color={colors.text} />
                        <Text style={[s.pillText, { color: colors.text, marginLeft: 6 }]}>고스트 모드</Text>
                    </View>
                </View>

                <TouchableOpacity hitSlop={10}>
                    <Ionicons name={"volume-high-outline" as IoniconName} size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 22 }}>
                {/* 상단 경쟁 카드 */}
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={s.cardTopRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name={"medal-outline" as IoniconName} size={18} color={colors.text} />
                            <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>실시간 경쟁</Text>
                        </View>

                        <View style={[s.badge, { backgroundColor: colors.primary }]}>
                            <Text style={[s.badgeText, { color: colors.background }]}>🔥 23m 뒤처짐</Text>
                        </View>
                    </View>

                    <View style={s.rankRow}>
                        <Text style={[s.rankLabel, { color: colors.mutedText }]}>🏆 내 최고 기록</Text>
                        <Text style={[s.rankValue, { color: colors.mutedText }]}>0.05 km</Text>
                    </View>

                    <View style={s.rankRow}>
                        <Text style={[s.rankLabel, { color: colors.mutedText }]}>👻 YOU</Text>
                        <Text style={[s.rankValue, { color: colors.mutedText }]}>0.03 km</Text>
                    </View>

                    <View style={[s.progressBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[s.progressFill, { width: "40%", backgroundColor: colors.primary }]} />
                    </View>

                    <View style={s.progressMarks}>
                        <Text style={[s.mark, { color: colors.mutedText }]}>0km</Text>
                        <Text style={[s.mark, { color: colors.mutedText }]}>2.6km</Text>
                        <Text style={[s.mark, { color: colors.mutedText }]}>5.2km</Text>
                    </View>
                </View>

                {/* 3개 지표 카드 */}
                <View style={s.metricsRow}>
                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>시간</Text>
                        <Text style={[s.metricValue, { color: colors.text }]}>00:00:15</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border, marginLeft: 10 }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>거리</Text>
                        <Text style={[s.metricValue, { color: colors.text }]}>0.03</Text>
                        <Text style={[s.metricUnit, { color: colors.mutedText }]}>km</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border, marginLeft: 10 }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>페이스</Text>
                        <Text style={[s.metricValue, { color: colors.text }]}>8'19"</Text>
                        <Text style={[s.metricUnit, { color: colors.mutedText }]}>/km</Text>
                    </View>
                </View>

                {/* 페이스 변화(간단 placeholder) */}
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={"analytics-outline" as IoniconName} size={18} color={colors.text} />
                        <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>페이스 변화</Text>
                    </View>

                    <View style={[s.fakeChart, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[s.fakeChartLine, { backgroundColor: colors.primary, width: "70%" }]} />
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                        <Text style={[s.small, { color: colors.mutedText }]}>시작</Text>
                        <Text style={[s.small, { color: colors.mutedText }]}>현재 페이스: 8'19"/km</Text>
                    </View>
                </View>

                {/* 선택된 고스트 요약 */}
                <View style={[s.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={"trophy-outline" as IoniconName} size={18} color={colors.text} />
                        <Text style={[s.summaryTitle, { color: colors.text, marginLeft: 8 }]}>내 최고 기록 고스트</Text>
                    </View>

                    <View style={s.summaryRow}>
                        <View style={s.summaryCol}>
                            <Text style={[s.summaryLabel, { color: colors.mutedText }]}>거리</Text>
                            <Text style={[s.summaryValue, { color: colors.text }]}>
                                {ghost ? formatKm(ghost.targetDistanceKm) : "5.2 km"}
                            </Text>
                        </View>

                        <View style={s.summaryCol}>
                            <Text style={[s.summaryLabel, { color: colors.mutedText }]}>페이스</Text>
                            <Text style={[s.summaryValue, { color: colors.text }]}>
                                {ghost ? `${formatPaceSecToText(ghost.avgPace)}/km` : `4'42"/km`}
                            </Text>
                        </View>

                        <View style={s.summaryCol}>
                            <Text style={[s.summaryLabel, { color: colors.mutedText }]}>타입</Text>
                            <Text style={[s.summaryValue, { color: colors.text }]}>{ghost?.type ?? "PERSONAL_BEST"}</Text>
                        </View>
                    </View>
                </View>

                {/* 하단 버튼 */}
                <View style={s.controls}>
                    <TouchableOpacity style={[s.controlBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name={"pause" as IoniconName} size={22} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[s.stopBtn, { backgroundColor: "#ff3b30", marginLeft: 14 }]}>
                        <Ionicons name={"stop" as IoniconName} size={22} color={"white"} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerCenter: { flex: 1, alignItems: "center" },

    // ✅ gap 제거
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    pillText: { fontWeight: "800", fontSize: 13 },

    card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontWeight: "900", fontSize: 14 },

    badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontWeight: "900", fontSize: 12 },

    rankRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    rankLabel: { fontSize: 12, fontWeight: "700" },
    rankValue: { fontSize: 12, fontWeight: "700" },

    progressBar: { height: 10, borderRadius: 999, borderWidth: 1, marginTop: 12, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 999 },
    progressMarks: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
    mark: { fontSize: 11 },

    // ✅ gap 제거
    metricsRow: { flexDirection: "row", marginBottom: 12 },
    metric: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12 },
    metricLabel: { fontSize: 12, fontWeight: "700" },
    metricValue: { fontSize: 18, fontWeight: "900", marginTop: 6 },
    metricUnit: { fontSize: 12, marginTop: 2, fontWeight: "700" },

    fakeChart: { height: 120, borderRadius: 14, borderWidth: 1, marginTop: 12, padding: 12, justifyContent: "flex-end" },
    fakeChartLine: { height: 4, borderRadius: 999 },
    small: { fontSize: 11, fontWeight: "700" },

    summary: { borderWidth: 1, borderRadius: 16, padding: 14 },
    summaryTitle: { fontWeight: "900", fontSize: 14 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    summaryCol: { alignItems: "center", flex: 1 },
    summaryLabel: { fontSize: 11, fontWeight: "700" },
    summaryValue: { fontSize: 13, fontWeight: "900", marginTop: 6 },

    // ✅ gap 제거
    controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 14 },
    controlBtn: { width: 64, height: 54, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    stopBtn: { width: 74, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
