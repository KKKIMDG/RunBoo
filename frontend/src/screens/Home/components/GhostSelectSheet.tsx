import React, { useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    useColorScheme,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { FriendTierGhostDto, GhostProfileDto } from "@/types/ghost";
import type { RecordDto } from "@/types/record";
import { formatPaceSecToText, formatKm } from "@/screens/ghost/format";
import { fetchNationalRankingTop5 } from "@/services/record/recordsService";
import { fetchFriendTierBestGhosts } from "@/services/ghost/ghostService";
import { getStyles } from "./GhostSelectSheet.styles";
import { useSettings } from "@/screens/Settings/useSettings";

type Props = {
    visible: boolean;
    scheme: "light" | "dark";
    loading: boolean;
    data: GhostProfileDto[];
    onClose: () => void;
    onSelect?: (gp: GhostProfileDto) => void;
    onRefresh?: () => void;
};

type GhostType =
    | "SELF_BEST"
    | "SELF_YESTERDAY"
    | "SELF_WEEKLY_AVG"
    | "FRIEND_TIER_BEST"
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
    if (x === "FRIEND_TIER_BEST") return "FRIEND_TIER_BEST";
    if (x === "RANKING_NATIONAL_1") return "RANKING_NATIONAL_1";
    if (x === "RANKING_NATIONAL_2") return "RANKING_NATIONAL_2";
    if (x === "RANKING_NATIONAL_3") return "RANKING_NATIONAL_3";
    if (x === "RANKING_NATIONAL_4") return "RANKING_NATIONAL_4";
    if (x === "RANKING_NATIONAL_5") return "RANKING_NATIONAL_5";
    return "UNKNOWN";
}

type SlotType = GhostType;
type TabKey = "self" | "friend" | "ranking";

type Row = {
    key: SlotType;
    slot: SlotType;
    title: string;
    profile: GhostProfileDto | null;
};

type FriendRow = {
    key: string;
    title: string;
    subtitle: string;
    dto: FriendTierGhostDto;
};

function getTitleBySlot(slot: SlotType) {
    if (slot === "SELF_BEST") return "내 최고 기록";
    if (slot === "SELF_YESTERDAY") return "직전 기록";
    if (slot === "SELF_WEEKLY_AVG") return "이번 주 평균";
    if (slot === "FRIEND_TIER_BEST") return "친구 고스트";
    if (slot === "RANKING_NATIONAL_1") return "전국 1위";
    if (slot === "RANKING_NATIONAL_2") return "전국 2위";
    if (slot === "RANKING_NATIONAL_3") return "전국 3위";
    if (slot === "RANKING_NATIONAL_4") return "전국 4위";
    return "전국 5위";
}

function getIconBySlot(slot: SlotType): any {
    if (
        slot === "SELF_BEST" ||
        slot === "RANKING_NATIONAL_1" ||
        slot === "RANKING_NATIONAL_2" ||
        slot === "RANKING_NATIONAL_3"
    )
        return "trophy-outline";
    if (slot === "SELF_YESTERDAY") return "today-outline";
    if (slot === "SELF_WEEKLY_AVG") return "bar-chart-outline";
    if (slot === "FRIEND_TIER_BEST") return "people-outline";
    return "medal-outline";
}

function safeDate10(iso: string) {
    if (!iso) return "-";
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}.${m[2]}.${m[3]}`;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
        2,
        "0"
    )}.${String(d.getDate()).padStart(2, "0")}`;
}

function safeWeekRangeLabel(weekStartIso: string) {
    if (!weekStartIso) return "-";
    const start = new Date(weekStartIso);
    if (isNaN(start.getTime())) return "-";
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(
        2,
        "0"
    )}.${String(start.getDate()).padStart(
        2,
        "0"
    )} ~ ${end.getFullYear()}.${String(end.getMonth() + 1).padStart(
        2,
        "0"
    )}.${String(end.getDate()).padStart(2, "0")}`;
}

function hasAnyRanking(list: GhostProfileDto[]) {
    return (list ?? []).some((gp) =>
        normalizeType((gp as any)?.type).startsWith("RANKING_NATIONAL")
    );
}

function toRankingGhostProfiles(top: RecordDto[]): GhostProfileDto[] {
    return (top ?? []).slice(0, 5).map(
        (r: any, idx) =>
            ({
                id: -(1000 + idx + 1),
                runRecordId: r?.id ?? null,
                type: `RANKING_NATIONAL_${idx + 1}`,
                targetDistanceKm: Number(r?.distanceM ?? 0) / 1000,
                avgPace: Number(r?.avgPace ?? 0),
                createdAt: String(r?.startedAt ?? r?.createdAt ?? ""),
            } as any)
    );
}

export default function GhostSelectSheet({
                                             visible,
                                             loading,
                                             data,
                                             onClose,
                                             onSelect,
                                         }: Props) {
    const { settings } = useSettings();
    const colorScheme = useColorScheme() ?? "light";

    const s = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const [tab, setTab] = useState<TabKey>("self");

    // ===== 랭킹 로딩(기존 기능 유지) =====
    const [rankingLocalLoading, setRankingLocalLoading] = useState(false);
    const [rankingLocal, setRankingLocal] = useState<GhostProfileDto[]>([]);

    useEffect(() => {
        let alive = true;
        async function loadRanking() {
            if (!visible || tab !== "ranking") return;
            if (hasAnyRanking(data ?? [])) {
                if (alive) setRankingLocal([]);
                return;
            }
            if (rankingLocal.length > 0) return;
            try {
                if (alive) setRankingLocalLoading(true);
                const top5 = await fetchNationalRankingTop5();
                if (alive) setRankingLocal(toRankingGhostProfiles(top5));
            } finally {
                if (alive) setRankingLocalLoading(false);
            }
        }
        loadRanking();
        return () => {
            alive = false;
        };
    }, [visible, tab, data]);

    // ===== 친구 로딩(신규 추가) =====
    const [friendLocalLoading, setFriendLocalLoading] = useState(false);
    const [friendLocal, setFriendLocal] = useState<FriendTierGhostDto[]>([]);

    useEffect(() => {
        let alive = true;

        async function loadFriends() {
            if (!visible || tab !== "friend") return;
            if (friendLocal.length > 0) return;

            try {
                if (alive) setFriendLocalLoading(true);

                const list = await fetchFriendTierBestGhosts();
                console.log("[FriendGhost] raw response:", list);

                if (alive) setFriendLocal((list ?? []) as FriendTierGhostDto[]);
            } catch (e) {
                console.error("[FriendGhost] fetch failed:", e);
            } finally {
                if (alive) setFriendLocalLoading(false);
            }
        }

        loadFriends();
        return () => {
            alive = false;
        };
    }, [visible, tab, friendLocal.length]);

    // ===== 기존 mergedData 로직(내 기록/랭킹 유지) =====
    const mergedData = useMemo(() => {
        if (hasAnyRanking(data ?? [])) return data;
        if (rankingLocal.length === 0) return data;
        return [...data, ...rankingLocal];
    }, [data, rankingLocal]);

    const byType = useMemo(() => {
        const map = new Map<GhostType, GhostProfileDto>();
        for (const gp of mergedData ?? []) {
            const t = normalizeType((gp as any)?.type);
            if (t !== "UNKNOWN" && !map.has(t)) map.set(t, gp);
        }
        return map;
    }, [mergedData]);

    const pickOne = (t: GhostType) => byType.get(t) ?? null;

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

    // ===== 친구 rows (신규) =====
    const friendRows: FriendRow[] = useMemo(() => {
        return (friendLocal ?? []).map((dto) => {
            const name = String(dto?.friendNickname ?? "친구");
            const dateIso = String((dto as any)?.startedAt ?? dto?.createdAt ?? "");
            const date = safeDate10(dateIso);
            return {
                key: `friend-${dto.friendUserId}-${dto.runRecordId}`,
                title: name,
                subtitle: date,
                dto,
            };
        });
    }, [friendLocal]);

    const isBusy = loading || rankingLocalLoading || friendLocalLoading;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={s.backdrop}>
                <TouchableOpacity
                    style={s.backdropTouch}
                    onPress={onClose}
                    activeOpacity={1}
                />
                <View style={s.sheet}>
                    <View style={s.header}>
                        <Text style={s.headerTitle}>고스트 선택</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* ✅ 탭 순서: 내 기록 -> 친구 -> 랭킹 */}
                    <View style={s.tabRow}>
                        <TouchableOpacity
                            style={[s.tabPill, tab === "self" && s.tabPillActive]}
                            onPress={() => setTab("self")}
                        >
                            <Ionicons
                                name="time-outline"
                                size={16}
                                color={tab === "self" ? "#fff" : s.tabText.color}
                            />
                            <Text style={[s.tabText, tab === "self" && s.tabTextActive]}>
                                내 기록
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.tabPill, tab === "friend" && s.tabPillActive]}
                            onPress={() => setTab("friend")}
                        >
                            <Ionicons
                                name="people-outline"
                                size={16}
                                color={tab === "friend" ? "#fff" : s.tabText.color}
                            />
                            <Text style={[s.tabText, tab === "friend" && s.tabTextActive]}>
                                친구
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.tabPill, tab === "ranking" && s.tabPillActive]}
                            onPress={() => setTab("ranking")}
                        >
                            <Ionicons
                                name="podium-outline"
                                size={16}
                                color={tab === "ranking" ? "#fff" : s.tabText.color}
                            />
                            <Text style={[s.tabText, tab === "ranking" && s.tabTextActive]}>
                                랭킹
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {isBusy ? (
                        <View style={s.loadingBox}>
                            <ActivityIndicator color={s.iconColor.color} />
                        </View>
                    ) : tab === "friend" ? (
                        friendRows.length === 0 ? (
                            <View style={s.emptyBox}>
                                <Ionicons
                                    name="people-outline"
                                    size={22}
                                    color={s.itemSub.color}
                                />
                                <Text style={s.emptyText}>친구 고스트가 없어요</Text>
                                <Text style={s.emptySubText}>
                                    친구 중 Tier 기록이 있는 사람만 표시돼요
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={friendRows}
                                keyExtractor={(i) => i.key}
                                contentContainerStyle={s.listContent}
                                renderItem={({ item }) => {
                                    const d = item.dto;

                                    const distanceM = Number((d as any)?.distanceM ?? 0);
                                    const km = distanceM / 1000;
                                    const pace = Number(d.avgPace ?? 0);

                                    return (
                                        <TouchableOpacity
                                            style={s.item}
                                            onPress={() => {
                                                // ✅ 기존 onSelect(gp: GhostProfileDto) 유지
                                                const gpForSelect: GhostProfileDto = {
                                                    id: d.runRecordId, // ghostProfileId가 없으니 runRecordId를 임시 id로 사용
                                                    userId: d.friendUserId,
                                                    runRecordId: d.runRecordId,
                                                    type: "FRIEND_TIER_BEST",
                                                    targetDistanceKm: km,
                                                    avgPace: pace,
                                                    createdAt: String(
                                                        (d as any)?.startedAt ?? d.createdAt ?? ""
                                                    ),
                                                } as any;

                                                onClose?.();
                                                onSelect?.(gpForSelect);
                                            }}
                                            activeOpacity={0.85}
                                        >
                                            {d.friendProfileImageUrl ? (
                                                <Image
                                                    source={{ uri: String(d.friendProfileImageUrl) }}
                                                    style={s.friendAvatar}
                                                />
                                            ) : (
                                                <View style={s.friendAvatarFallback}>
                                                    <Ionicons
                                                        name="person"
                                                        size={16}
                                                        color={s.friendAvatarIcon.color}
                                                    />
                                                </View>
                                            )}

                                            <View style={s.itemLeft}>
                                                <Text style={s.itemTitle}>{item.title}</Text>
                                                <Text style={s.itemSub}>{item.subtitle}</Text>
                                            </View>

                                            <View style={s.itemRight}>
                                                <Text style={s.itemTitle}>{formatKm(km)}</Text>
                                                <Text style={s.itemSub}>
                                                    {formatPaceSecToText(pace)}/km
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )
                    ) : (
                        <FlatList
                            data={tab === "self" ? selfRows : rankingRows}
                            keyExtractor={(i) => i.key}
                            contentContainerStyle={s.listContent}
                            renderItem={({ item }) => {
                                const gp = item.profile;
                                if (!gp) {
                                    return (
                                        <View style={[s.item, { opacity: 0.6 }]}>
                                            <Ionicons
                                                name={getIconBySlot(item.slot)}
                                                size={18}
                                                color={s.itemSub.color}
                                            />
                                            <View style={s.itemLeft}>
                                                <Text style={s.itemTitle}>{item.title}</Text>
                                                <Text style={s.itemSub}>아직 데이터가 없어요</Text>
                                            </View>
                                            <View style={s.itemRight}>
                                                <Text style={s.itemTitle}>-</Text>
                                                <Text style={s.itemSub}>-</Text>
                                            </View>
                                        </View>
                                    );
                                }
                                const subText =
                                    item.slot === "SELF_WEEKLY_AVG"
                                        ? safeWeekRangeLabel(gp.createdAt)
                                        : safeDate10(gp.createdAt);

                                return (
                                    <TouchableOpacity
                                        style={s.item}
                                        onPress={() => {
                                            onClose?.();
                                            onSelect?.(gp);
                                        }}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={getIconBySlot(item.slot)}
                                            size={18}
                                            color={s.iconColor.color}
                                        />
                                        <View style={s.itemLeft}>
                                            <Text style={s.itemTitle}>{item.title}</Text>
                                            <Text style={s.itemSub}>{subText}</Text>
                                        </View>
                                        <View style={s.itemRight}>
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
