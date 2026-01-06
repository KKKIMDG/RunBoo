// frontend/src/screens/ghost/components/GhostSelectSheet.tsx

import React, { useMemo, useState, useEffect } from "react";
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
import type { RecordDto } from "@/types/record";
import { Colors } from "@/constants/theme";
import { formatPaceSecToText, formatKm } from "@/screens/ghost/format";
import { fetchNationalRankingTop5 } from "@/services/record/recordsService";

type Props = {
    visible: boolean;
    scheme: "light" | "dark";
    loading: boolean;
    data: GhostProfileDto[];
    onClose: () => void;
    onSelect?: (gp: GhostProfileDto) => void; // ✅ 부모가 navigate 처리
    onRefresh?: () => void;
};

type GhostType =
    | "SELF_BEST"
    | "SELF_YESTERDAY"
    | "SELF_WEEKLY_AVG"
    | "RANKING_NATIONAL_1"
    | "RANKING_NATIONAL_2"
    | "RANKING_NATIONAL_3"
    | "RANKING_NATIONAL_4"
    | "RANKING_NATIONAL_5";

function normalizeType(t: string): GhostType | "UNKNOWN" {
    const x = String(t ?? "").trim().toUpperCase();
    if (x === "SELF_BEST") return "SELF_BEST";
    if (x === "SELF_YESTERDAY") return "SELF_YESTERDAY";
    if (x === "SELF_WEEKLY_AVG") return "SELF_WEEKLY_AVG";
    if (x === "RANKING_NATIONAL_1") return "RANKING_NATIONAL_1";
    if (x === "RANKING_NATIONAL_2") return "RANKING_NATIONAL_2";
    if (x === "RANKING_NATIONAL_3") return "RANKING_NATIONAL_3";
    if (x === "RANKING_NATIONAL_4") return "RANKING_NATIONAL_4";
    if (x === "RANKING_NATIONAL_5") return "RANKING_NATIONAL_5";
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
    | "today-outline"
    | "location-outline";

function getTitleBySlot(slot: SlotType) {
    if (slot === "SELF_BEST") return "내 최고 기록";
    if (slot === "SELF_YESTERDAY") return "직전 기록";
    if (slot === "SELF_WEEKLY_AVG") return "이번 주 평균";
    if (slot === "RANKING_NATIONAL_1") return "전국 1위";
    if (slot === "RANKING_NATIONAL_2") return "전국 2위";
    if (slot === "RANKING_NATIONAL_3") return "전국 3위";
    if (slot === "RANKING_NATIONAL_4") return "전국 4위";
    return "전국 5위";
}

function getIconBySlot(slot: SlotType): IoniconName {
    if (slot === "SELF_BEST") return "trophy-outline";
    if (slot === "SELF_YESTERDAY") return "today-outline";
    if (slot === "SELF_WEEKLY_AVG") return "bar-chart-outline";
    if (
        slot === "RANKING_NATIONAL_1" ||
        slot === "RANKING_NATIONAL_2" ||
        slot === "RANKING_NATIONAL_3"
    )
        return "trophy-outline";
    if (slot === "RANKING_NATIONAL_4" || slot === "RANKING_NATIONAL_5")
        return "medal-outline";
    return "location-outline";
}

function safeDate10(iso: string) {
    if (!iso) return "-";
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}.${m[2]}.${m[3]}`;

    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
}

function safeWeekRangeLabel(weekStartIso: string) {
    if (!weekStartIso) return "-";
    const start = new Date(weekStartIso);
    if (isNaN(start.getTime())) return "-";

    // start ~ start+6일
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const sYY = String(start.getFullYear());
    const sMM = String(start.getMonth() + 1).padStart(2, "0");
    const sDD = String(start.getDate()).padStart(2, "0");

    const eYY = String(end.getFullYear());
    const eMM = String(end.getMonth() + 1).padStart(2, "0");
    const eDD = String(end.getDate()).padStart(2, "0");

    return `${sYY}.${sMM}.${sDD} ~ ${eYY}.${eMM}.${eDD}`;
}

type TabKey = "self" | "ranking";

type Row = {
    key: SlotType;
    slot: SlotType;
    title: string;
    profile: GhostProfileDto | null;
};

function hasAnyRanking(list: GhostProfileDto[]) {
    return (list ?? []).some((gp) => {
        const t = normalizeType((gp as any)?.type);
        return (
            t === "RANKING_NATIONAL_1" ||
            t === "RANKING_NATIONAL_2" ||
            t === "RANKING_NATIONAL_3" ||
            t === "RANKING_NATIONAL_4" ||
            t === "RANKING_NATIONAL_5"
        );
    });
}

// RecordDto -> GhostProfileDto(RANKING_NATIONAL_1~5)
function toRankingGhostProfiles(top: RecordDto[]): GhostProfileDto[] {
    const list = (top ?? []).slice(0, 5);

    return list.map((r: any, idx) => {
        const rank = idx + 1;

        // 백엔드 RecordDto: distanceM(Double), avgPace(Integer), startedAt(LocalDateTime), endedAt(LocalDateTime), mode(String)
        const distanceM = Number(r?.distanceM ?? 0);
        const avgPace = Number(r?.avgPace ?? 0);
        const iso = String(r?.startedAt ?? r?.createdAt ?? "");

        return {
            id: -(1000 + rank), // 프론트 임시 id (겹치지만 않게)
            runRecordId: r?.id ?? null,
            type: `RANKING_NATIONAL_${rank}`,
            targetDistanceKm: distanceM / 1000,
            avgPace,
            createdAt: iso || new Date().toISOString(),
        } as any;
    });
}

export default function GhostSelectSheet({
                                             visible,
                                             scheme,
                                             loading,
                                             data,
                                             onClose,
                                             onSelect,
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

    // ✅ 랭킹 로컬 데이터 (부모가 안 내려줘도 여기서 조회해서 채움)
    const [rankingLocalLoading, setRankingLocalLoading] = useState(false);
    const [rankingLocal, setRankingLocal] = useState<GhostProfileDto[]>([]);

    // ✅ 랭킹 탭 + 시트 열림 + 부모 data에 랭킹 없음 → TOP5 조회
    useEffect(() => {
        let alive = true;

        async function loadRanking() {
            if (!visible) return;
            if (tab !== "ranking") return;

            // 부모가 이미 랭킹을 내려주면 로컬은 비움
            if (hasAnyRanking(data ?? [])) {
                if (alive) setRankingLocal([]);
                return;
            }

            // 이미 로컬에 있으면 중복 호출 방지
            if ((rankingLocal ?? []).length > 0) return;

            try {
                if (alive) setRankingLocalLoading(true);
                const top5 = await fetchNationalRankingTop5();
                const converted = toRankingGhostProfiles(top5);
                if (alive) setRankingLocal(converted);
            } finally {
                if (alive) setRankingLocalLoading(false);
            }
        }

        loadRanking();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, tab, data]);

    // ✅ 렌더에 쓸 최종 데이터: (부모 data) + (로컬 랭킹)
    const mergedData = useMemo(() => {
        const baseList = data ?? [];
        if (hasAnyRanking(baseList)) return baseList;
        if ((rankingLocal ?? []).length === 0) return baseList;
        return [...baseList, ...rankingLocal];
    }, [data, rankingLocal]);

    const byType = useMemo(() => {
        const map = new Map<GhostType, GhostProfileDto>();
        for (const gp of mergedData ?? []) {
            const t = normalizeType((gp as any)?.type);
            if (t !== "UNKNOWN" && !map.has(t)) {
                map.set(t, gp);
            }
        }
        return map;
    }, [mergedData]);

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
            [
                "RANKING_NATIONAL_1",
                "RANKING_NATIONAL_2",
                "RANKING_NATIONAL_3",
                "RANKING_NATIONAL_4",
                "RANKING_NATIONAL_5",
            ].map((slot) => ({
                key: slot as SlotType,
                slot: slot as SlotType,
                title: getTitleBySlot(slot as SlotType),
                profile: pickOne(slot as SlotType),
            })),
        [byType]
    );

    const rows = tab === "self" ? selfRows : rankingRows;

    const handleSelect = (gp: GhostProfileDto) => {
        onClose?.();
        onSelect?.(gp); // ✅ 부모(HomeScreen)가 navigate 처리
    };

    // ✅ 전체 로딩: 부모 로딩 + 랭킹 로컬 로딩
    const isBusy = loading || rankingLocalLoading;

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
                            style={[s.pill, tab === "self" && { backgroundColor: c.primary }]}
                            onPress={() => setTab("self")}
                        >
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={tab === "self" ? "#fff" : c.text}
                            />
                            <Text style={[s.pillText, { color: tab === "self" ? "#fff" : c.text }]}>
                                내 기록
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.pill, tab === "ranking" && { backgroundColor: c.primary }]}
                            onPress={() => setTab("ranking")}
                        >
                            <Ionicons
                                name="people-outline"
                                size={16}
                                color={tab === "ranking" ? "#fff" : c.text}
                            />
                            <Text style={[s.pillText, { color: tab === "ranking" ? "#fff" : c.text }]}>
                                랭킹
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {isBusy ? (
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

                                // ✅ SELF_WEEKLY_AVG만 기간으로 표기
                                const subText =
                                    item.slot === "SELF_WEEKLY_AVG"
                                        ? safeWeekRangeLabel(gp.createdAt)
                                        : safeDate10(gp.createdAt);

                                return (
                                    <TouchableOpacity
                                        style={[s.item, { borderColor: c.border }]}
                                        onPress={() => handleSelect(gp)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={getIconBySlot(item.slot)}
                                            size={18}
                                            color={c.primary}
                                        />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={s.itemTitle}>{item.title}</Text>
                                            <Text style={s.itemSub}>{subText}</Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={s.itemTitle}>{formatKm(gp.targetDistanceKm)}</Text>
                                            <Text style={s.itemSub}>{formatPaceSecToText(gp.avgPace)}/km</Text>
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
});
