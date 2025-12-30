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

type SlotType = GhostType;

type IoniconName =
    | "close"
    | "time-outline"
    | "people-outline"
    | "trophy-outline"
    | "trending-up-outline"
    | "bar-chart-outline"
    | "body-outline"
    | "medal-outline"
    | "location-outline";

function getTitleBySlot(slot: SlotType) {
    if (slot === "SELF_BEST") return "내 최고 기록";
    if (slot === "SELF_YESTERDAY") return "어제 기록";
    if (slot === "SELF_WEEKLY_AVG") return "이번 주 평균";
    if (slot === "RANKING_NATIONAL") return "전국 1위(이강빈)";
    return "지역 챔피언(이동국)";
}

function getIconBySlot(slot: SlotType): IoniconName {
    if (slot === "SELF_BEST") return "trophy-outline";
    if (slot === "SELF_YESTERDAY") return "trending-up-outline";
    if (slot === "SELF_WEEKLY_AVG") return "bar-chart-outline";
    if (slot === "RANKING_NATIONAL") return "medal-outline";
    return "location-outline";
}

function safeDate10(iso: string) {
    if (!iso) return "-";

    // 1) ISO 형태면 YYYY-MM-DD만 잘라서 사용 (타임존 변환 없음)
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}.${m[2]}.${m[3]}`;

    // 2) 혹시 다른 포맷이면 최후 fallback
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
}

type TabKey = "self" | "ranking";

type Row = {
    key: SlotType;
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
        mutedText: base?.mutedText ?? "#6B7280",
    };

    const [tab, setTab] = useState<TabKey>("self");

    const byType = useMemo(() => {
        const map = new Map<GhostType, GhostProfileDto>();
        for (const gp of data ?? []) {
            const t = normalizeType((gp as any)?.type);
            if (t !== "UNKNOWN" && !map.has(t)) {
                map.set(t, gp);
            }
        }
        return map;
    }, [data]);

    function pickOne(t: GhostType) {
        return byType.get(t) ?? null;
    }

    const selfRows: Row[] = useMemo(
        () =>
            ["SELF_BEST", "SELF_YESTERDAY", "SELF_WEEKLY_AVG"].map((slot) => ({
                key: slot as SlotType,
                slot: slot as SlotType,
                title: getTitleBySlot(slot as SlotType),
                profile: pickOne(slot as SlotType),
            })),
        [byType]
    );

    const rankingRows: Row[] = useMemo(
        () =>
            ["RANKING_NATIONAL", "RANKING_LOCAL"].map((slot) => ({
                key: slot as SlotType,
                slot: slot as SlotType,
                title: getTitleBySlot(slot as SlotType),
                profile: pickOne(slot as SlotType),
            })),
        [byType]
    );

    const rows = tab === "self" ? selfRows : rankingRows;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={s.backdrop}>
                <TouchableOpacity style={s.backdropTouch} onPress={onClose} />

                <View style={[s.sheet, { backgroundColor: c.background }]}>
                    {/* Header */}
                    <View style={[s.sheetHeader, { backgroundColor: c.primary }]}>
                        <Text style={[s.sheetTitle, { color: "#fff" }]}>고스트 선택</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={s.tabRow}>
                        <TouchableOpacity
                            style={[
                                s.pill,
                                tab === "self" && { backgroundColor: c.primary },
                            ]}
                            onPress={() => setTab("self")}
                        >
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={tab === "self" ? "#fff" : c.text}
                            />
                            <Text
                                style={[
                                    s.pillText,
                                    { color: tab === "self" ? "#fff" : c.text },
                                ]}
                            >
                                내 기록
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                s.pill,
                                tab === "ranking" && { backgroundColor: c.primary },
                            ]}
                            onPress={() => setTab("ranking")}
                        >
                            <Ionicons
                                name="people-outline"
                                size={16}
                                color={tab === "ranking" ? "#fff" : c.text}
                            />
                            <Text
                                style={[
                                    s.pillText,
                                    { color: tab === "ranking" ? "#fff" : c.text },
                                ]}
                            >
                                랭킹
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={s.loadingBox}>
                            <ActivityIndicator />
                        </View>
                    ) : (
                        <FlatList
                            data={rows}
                            keyExtractor={(i) => i.key}
                            contentContainerStyle={{ paddingBottom: 12 }}
                            renderItem={({ item }) => {
                                const gp = item.profile;
                                if (!gp) {
                                    return (
                                        <View
                                            style={[
                                                s.item,
                                                {
                                                    borderColor: c.border,
                                                    backgroundColor: c.background,
                                                    opacity: 0.75,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={getIconBySlot(item.slot)}
                                                size={18}
                                                color={c.mutedText}
                                            />

                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text style={s.itemTitle}>{item.title}</Text>
                                                <Text style={s.itemSub}>아직 데이터가 없어요</Text>
                                            </View>

                                            <View style={{ alignItems: "flex-end" }}>
                                                <Text style={s.itemTitle}>-</Text>
                                                <Text style={s.itemSub}>-</Text>
                                            </View>
                                        </View>
                                    );
                                }


                                return (
                                    <TouchableOpacity
                                        style={[s.item, { borderColor: c.border }]}
                                        onPress={() => onSelect(gp)}
                                    >
                                        <Ionicons
                                            name={getIconBySlot(item.slot)}
                                            size={18}
                                            color={c.primary}
                                        />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={s.itemTitle}>{item.title}</Text>
                                            <Text style={s.itemSub}>{safeDate10(gp.createdAt)}</Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={s.itemTitle}>
                                                {formatKm(gp.targetDistanceKm)}
                                            </Text>
                                            <Text style={s.itemSub}>
                                                {formatPaceSecToText(gp.avgPace)}/km
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    backdropTouch: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    sheet: {
        width: "100%",
        maxWidth: 420,
        maxHeight: "70%",
        borderRadius: 18,
        overflow: "hidden",
    },
    sheetHeader: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sheetTitle: { fontSize: 16, fontWeight: "800" },

    tabRow: { flexDirection: "row", padding: 14 },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        marginRight: 8,
    },
    pillText: { marginLeft: 6, fontSize: 13, fontWeight: "700" },

    loadingBox: { padding: 20 },

    item: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderWidth: 1,
        borderRadius: 14,
        marginHorizontal: 14,
        marginTop: 10,
    },
    itemTitle: { fontSize: 14, fontWeight: "800" },
    itemSub: { fontSize: 12, color: "#6B7280", marginTop: 4 },
    emptyText: { fontSize: 14, color: "#9CA3AF" },
});
