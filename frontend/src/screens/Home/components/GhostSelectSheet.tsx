// frontend/src/screens/ghost/components/GhostSelectSheet.tsx

import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { GhostProfileDto } from "@/types/ghost";
import { Colors } from "@/constants/theme";
import { formatPaceSecToText, formatKm } from "@/screens/ghost/format";

type Props = {
    visible: boolean;
    scheme: "light" | "dark";
    loading: boolean;
    data: GhostProfileDto[];
    onClose: () => void;
    onSelect: (gp: GhostProfileDto) => void;
    onRefresh?: () => void;
};

type GhostType =
    | "SELF_BEST"
    | "SELF_YESTERDAY"
    | "SELF_WEEKLY_AVG"
    | "RANKING_NATIONAL"
    | "RANKING_LOCAL";

function normalizeType(t: string): GhostType | "UNKNOWN" {
    const x = String(t ?? "").trim().toUpperCase();
    if (x === "SELF_BEST") return "SELF_BEST";
    if (x === "SELF_YESTERDAY") return "SELF_YESTERDAY";
    if (x === "SELF_WEEKLY_AVG") return "SELF_WEEKLY_AVG";
    if (x === "RANKING_NATIONAL") return "RANKING_NATIONAL";
    if (x === "RANKING_LOCAL") return "RANKING_LOCAL";
    return "UNKNOWN";
}

type SlotType = Exclude<GhostType, never>;

type IoniconName =
    | "close"
    | "time-outline"
    | "people-outline"
    | "trophy-outline"
    | "trending-up-outline"
    | "bar-chart-outline"
    | "sparkles-outline"
    | "body-outline"
    | "medal-outline"
    | "location-outline";

function getTitleBySlot(slot: SlotType) {
    if (slot === "SELF_BEST") return "내 최고 기록";
    if (slot === "SELF_YESTERDAY") return "어제 기록";
    if (slot === "SELF_WEEKLY_AVG") return "이번 주 평균";
    if (slot === "RANKING_NATIONAL") return "전국 1위(가빈시치)";
    return "지역 챔피언(이동국)";
}

function getIconBySlot(slot: SlotType): IoniconName {
    if (slot === "SELF_BEST") return "trophy-outline";
    if (slot === "SELF_YESTERDAY") return "trending-up-outline";
    if (slot === "SELF_WEEKLY_AVG") return "bar-chart-outline";
    if (slot === "RANKING_NATIONAL") return "medal-outline";
    return "location-outline";
}

// ✅ createdAt 표시 포맷(기존 로직 유지하되, ISO가 아닐 때도 안전)
function safeDate10(iso: string) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    // yyyy-mm-dd
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
}

type TabKey = "self" | "ranking";

type Row = {
    key: SlotType; //
    slot: SlotType;
    title: string;
    profile: GhostProfileDto | null;
};

export default function GhostSelectSheet({
                                             visible,
                                             scheme,
                                             loading,
                                             data,
                                             onClose,
                                             onSelect,
                                             onRefresh,
                                         }: Props) {
    const base = Colors[scheme] as any;

    const c = {
        background: base?.background ?? "#ffffff",
        text: base?.text ?? "#111111",
        primary: base?.primary ?? "#2F3A8F",
        card: base?.card ?? base?.surface ?? "#F3F4F6",
        border: base?.border ?? "#E5E7EB",
        mutedText: base?.mutedText ?? base?.subtext ?? "#6B7280",
        icon: base?.icon ?? base?.text ?? "#111111",
    };

    const [tab, setTab] = useState<TabKey>("self");

    const byType = useMemo(() => {
        const map = new Map<GhostType, GhostProfileDto>();
        for (const gp of data ?? []) {
            const t = normalizeType((gp as any)?.type);
            if (t !== "UNKNOWN") {
                // 한 타입이 여러 개일 때는 "가장 최신"을 우선하고 싶으면 여기서 비교 가능
                // 지금은 최초 1개만 사용
                if (!map.has(t)) map.set(t, gp);
            }
        }
        return map;
    }, [data]);

    function pickOne(t: GhostType): GhostProfileDto | null {
        return byType.get(t) ?? null;
    }

    const selfRows: Row[] = useMemo(() => {
        const slots: SlotType[] = ["SELF_BEST", "SELF_YESTERDAY", "SELF_WEEKLY_AVG"];
        return slots.map((slot) => ({
            key: slot,
            slot,
            title: getTitleBySlot(slot),
            profile: pickOne(slot),
        }));
    }, [byType]);

    const rankingRows: Row[] = useMemo(() => {
        const slots: SlotType[] = ["RANKING_NATIONAL", "RANKING_LOCAL"];
        return slots.map((slot) => ({
            key: slot,
            slot,
            title: getTitleBySlot(slot),
            profile: pickOne(slot),
        }));
    }, [byType]);

    const rows = tab === "self" ? selfRows : rankingRows;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={s.backdrop}>
                <TouchableOpacity
                    style={s.backdropTouch}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={[s.sheet, { backgroundColor: c.card }]}>
                    <View style={[s.sheetHeader, { backgroundColor: c.primary }]}>
                        <Text style={[s.sheetTitle, { color: c.background }]}>
                            고스트 선택
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={10}>
                            <Ionicons name={"close"} size={22} color={c.background} />
                        </TouchableOpacity>
                    </View>

                    {/* ✅ 탭 */}
                    <View style={s.tabRow}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => setTab("self")}
                            style={[
                                s.pill,
                                {
                                    backgroundColor: tab === "self" ? c.primary : "transparent",
                                    borderColor: tab === "self" ? "transparent" : c.border,
                                    borderWidth: tab === "self" ? 0 : 1,
                                },
                            ]}
                        >
                            <Ionicons
                                name={"time-outline"}
                                size={16}
                                color={tab === "self" ? c.background : c.text}
                            />
                            <Text
                                style={[
                                    s.pillText,
                                    {
                                        color: tab === "self" ? c.background : c.text,
                                        marginLeft: 6,
                                    },
                                ]}
                            >
                                내 기록
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => setTab("ranking")}
                            style={[
                                s.pill,
                                {
                                    backgroundColor: tab === "ranking" ? c.primary : "transparent",
                                    borderColor: tab === "ranking" ? "transparent" : c.border,
                                    borderWidth: tab === "ranking" ? 0 : 1,
                                },
                            ]}
                        >
                            <Ionicons
                                name={"people-outline"}
                                size={16}
                                color={tab === "ranking" ? c.background : c.text}
                            />
                            <Text
                                style={[
                                    s.pillText,
                                    {
                                        color: tab === "ranking" ? c.background : c.text,
                                        marginLeft: 6,
                                    },
                                ]}
                            >
                                랭킹
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={s.loadingBox}>
                            <ActivityIndicator />
                            <Text style={[s.loadingText, { color: c.text }]}>
                                불러오는 중...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 16 }}
                            data={rows}
                            keyExtractor={(item) => item.key}
                            onRefresh={onRefresh}
                            refreshing={false}
                            renderItem={({ item }) => {
                                const gp = item.profile;

                                // ✅ 빈 슬롯(데이터 없음) 카드
                                if (!gp) {
                                    return (
                                        <View
                                            style={[
                                                s.item,
                                                {
                                                    backgroundColor: c.background,
                                                    borderColor: c.border,
                                                    opacity: 0.75,
                                                },
                                            ]}
                                        >
                                            <View style={[s.iconBox, { backgroundColor: c.card }]}>
                                                <Ionicons
                                                    name={getIconBySlot(item.slot)}
                                                    size={18}
                                                    color={c.mutedText}
                                                />
                                            </View>

                                            <View style={s.itemMid}>
                                                <Text style={[s.itemTitle, { color: c.text }]}>
                                                    {item.title}
                                                </Text>
                                                <Text style={[s.itemSub, { color: c.mutedText }]}>
                                                    아직 데이터가 없어요.
                                                </Text>
                                            </View>

                                            <View style={s.itemRight}>
                                                <Text style={[s.kmText, { color: c.mutedText }]}>-</Text>
                                                <Text style={[s.paceText, { color: c.mutedText }]}>-</Text>
                                            </View>
                                        </View>
                                    );
                                }

                                // ✅ 정상 카드(선택 가능)
                                return (
                                    <TouchableOpacity
                                        style={[
                                            s.item,
                                            { backgroundColor: c.background, borderColor: c.border },
                                        ]}
                                        onPress={() => onSelect(gp)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={[s.iconBox, { backgroundColor: c.card }]}>
                                            <Ionicons
                                                name={getIconBySlot(item.slot)}
                                                size={18}
                                                color={c.primary}
                                            />
                                        </View>

                                        <View style={s.itemMid}>
                                            <Text style={[s.itemTitle, { color: c.text }]}>
                                                {item.title}
                                            </Text>
                                            <Text style={[s.itemSub, { color: c.mutedText }]}>
                                                {safeDate10(gp.createdAt)}
                                            </Text>
                                        </View>

                                        <View style={s.itemRight}>
                                            <Text style={[s.kmText, { color: c.text }]}>
                                                {formatKm(gp.targetDistanceKm)}
                                            </Text>
                                            <Text style={[s.paceText, { color: c.mutedText }]}>
                                                {formatPaceSecToText(gp.avgPace)}/km
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View style={s.emptyBox}>
                                    <Text style={{ color: c.mutedText }}>
                                        고스트 프로필이 아직 없어요.
                                    </Text>
                                    <Text style={{ color: c.mutedText, marginTop: 6 }}>
                                        일반 러닝 후에 고스트 저장을 해주세요.
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    <TouchableOpacity
                        style={[s.bottomButton, { backgroundColor: c.text }]}
                        onPress={onClose}
                    >
                        <Ionicons name={"body-outline"} size={18} color={c.background} />
                        <Text
                            style={[
                                s.bottomButtonText,
                                { color: c.background, marginLeft: 8 },
                            ]}
                        >
                            고스트 선택
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    backdropTouch: { flex: 1 },
    sheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: "hidden" },

    sheetHeader: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sheetTitle: { fontSize: 16, fontWeight: "800" },

    // ✅ gap 제거
    tabRow: { flexDirection: "row", padding: 14 },

    // ✅ 기존 pill/pillGhost를 통합해서 탭 상태에 따라 스타일 변경
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        marginRight: 10,
    },

    loadingBox: { padding: 18, alignItems: "center" },
    loadingText: { fontSize: 13, marginTop: 10 },

    item: {
        marginHorizontal: 14,
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    itemMid: { flex: 1, marginLeft: 12 },
    itemTitle: { fontSize: 14, fontWeight: "800" },
    itemSub: { fontSize: 12, marginTop: 4 },

    itemRight: { alignItems: "flex-end" },
    kmText: { fontSize: 14, fontWeight: "800" },
    paceText: { fontSize: 12, marginTop: 4 },

    emptyBox: { paddingHorizontal: 16, paddingVertical: 20 },

    bottomButton: {
        marginHorizontal: 14,
        marginBottom: 14,
        marginTop: 6,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    bottomButtonText: { fontSize: 15, fontWeight: "900" },
    pillText: { fontWeight: "700", fontSize: 13 },
});
