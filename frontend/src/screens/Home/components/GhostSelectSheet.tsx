import React from "react";
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

function getTitle(gp: GhostProfileDto) {
    if (gp.type === "PERSONAL_BEST") return "내 최고 기록";
    if (gp.type === "RECENT") return "어제 기록";
    if (gp.type === "WEEK_AVG") return "이번 주 평균";
    return "커스텀 고스트";
}

// ✅ 아이콘 타입 이슈 방지: Ionicons에서 흔히 쓰는 이름만 명시
type IoniconName =
    | "close"
    | "time-outline"
    | "people-outline"
    | "trophy-outline"
    | "trending-up-outline"
    | "bar-chart-outline"
    | "sparkles-outline"
    | "body-outline";

function getIconName(gp: GhostProfileDto): IoniconName {
    if (gp.type === "PERSONAL_BEST") return "trophy-outline";
    if (gp.type === "RECENT") return "trending-up-outline";
    if (gp.type === "WEEK_AVG") return "bar-chart-outline";
    return "sparkles-outline";
}

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

    // ✅ Colors에 없는 키 접근 때문에 나는 스타일 에러 방지용 fallback
    const c = {
        background: base?.background ?? "#ffffff",
        text: base?.text ?? "#111111",
        primary: base?.primary ?? "#2F3A8F",
        card: base?.card ?? base?.surface ?? "#F3F4F6",
        border: base?.border ?? "#E5E7EB",
        mutedText: base?.mutedText ?? base?.subtext ?? "#6B7280",
        icon: base?.icon ?? base?.text ?? "#111111",
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={s.backdrop}>
                <TouchableOpacity style={s.backdropTouch} activeOpacity={1} onPress={onClose} />

                <View style={[s.sheet, { backgroundColor: c.card }]}>
                    <View style={[s.sheetHeader, { backgroundColor: c.primary }]}>
                        <Text style={[s.sheetTitle, { color: c.background }]}>고스트 선택</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={10}>
                            <Ionicons name={"close"} size={22} color={c.background} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.tabRow}>
                        <View style={[s.pill, { backgroundColor: c.primary }]}>
                            <Ionicons name={"time-outline"} size={16} color={c.background} />
                            <Text style={[s.pillText, { color: c.background, marginLeft: 6 }]}>내 기록</Text>
                        </View>

                        <View style={[s.pillGhost, { borderColor: c.border }]}>
                            <Ionicons name={"people-outline"} size={16} color={c.text} />
                            <Text style={[s.pillText, { color: c.text, marginLeft: 6 }]}>랭킹</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={s.loadingBox}>
                            <ActivityIndicator />
                            <Text style={[s.loadingText, { color: c.text }]}>불러오는 중...</Text>
                        </View>
                    ) : (
                        <FlatList
                            contentContainerStyle={{ paddingBottom: 16 }}
                            data={data}
                            keyExtractor={(item) => String(item.id)}
                            onRefresh={onRefresh}
                            refreshing={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[s.item, { backgroundColor: c.background, borderColor: c.border }]}
                                    onPress={() => onSelect(item)}
                                    activeOpacity={0.9}
                                >
                                    <View style={[s.iconBox, { backgroundColor: c.card }]}>
                                        <Ionicons name={getIconName(item)} size={18} color={c.primary} />
                                    </View>

                                    <View style={s.itemMid}>
                                        <Text style={[s.itemTitle, { color: c.text }]}>{getTitle(item)}</Text>
                                        <Text style={[s.itemSub, { color: c.mutedText }]}>
                                            {new Date(item.createdAt).toISOString().slice(0, 10)}
                                        </Text>
                                    </View>

                                    <View style={s.itemRight}>
                                        <Text style={[s.kmText, { color: c.text }]}>
                                            {formatKm(item.targetDistanceKm)}
                                        </Text>
                                        <Text style={[s.paceText, { color: c.mutedText }]}>
                                            {formatPaceSecToText(item.avgPace)}/km
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={s.emptyBox}>
                                    <Text style={{ color: c.mutedText }}>고스트 프로필이 아직 없어.</Text>
                                    <Text style={{ color: c.mutedText, marginTop: 6 }}>
                                        기록에서 “고스트 저장” 같은 흐름을 만들면 여기서 선택 가능해져.
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    <TouchableOpacity style={[s.bottomButton, { backgroundColor: c.text }]} onPress={onClose}>
                        <Ionicons name={"body-outline"} size={18} color={c.background} />
                        <Text style={[s.bottomButtonText, { color: c.background, marginLeft: 8 }]}>
                            고스트 선택
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
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

    // ✅ gap 제거 (TS/RN에서 style error 흔함)
    tabRow: { flexDirection: "row", padding: 14 },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        marginRight: 10,
    },
    pillGhost: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: "transparent",
    },
    pillText: { fontWeight: "700", fontSize: 13 },

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
});
