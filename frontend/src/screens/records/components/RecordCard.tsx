//frontend/src/screens/records/components/RecordCard.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { RecordDto } from "@/types/record";
import {
    formatDate,
    formatKm,
    formatPace,
    formatTimeRange,
    formatDurationFromRange,
} from "./format";

export default function RecordCard({ item }: { item: RecordDto }) {
    return (
        <View style={s.card}>
            <View style={s.header}>
                <Text style={s.date}>{formatDate(item.startedAt)}</Text>
                <Text style={[
                    s.badge,
                    item.mode === "GHOST" && s.badgeGhost,
                    item.mode === "TIER" && s.badgeTier,
                ]}>
                    {item.mode === "GHOST"
                        ? "고스트"
                        : item.mode === "TIER"
                            ? "티어 측정"
                            : "일반 측정"}
                </Text>
            </View>

            <Text style={s.sub}>{formatTimeRange(item.startedAt, item.endedAt)}</Text>

            <View style={s.rowBox}>
                <Text style={s.label}>런닝 거리</Text>
                <Text style={s.value}>{formatKm(item.distanceM)}</Text>
            </View>

            <View style={s.rowBox}>
                <Text style={s.label}>평균 페이스</Text>
                <Text style={s.value}>{formatPace(item.avgPace)}</Text>
            </View>

            <View style={s.rowBox}>
                <Text style={s.label}>런닝 시간</Text>
                <Text style={s.value}>{formatDurationFromRange(item.startedAt, item.endedAt)}</Text>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        backgroundColor: "#F5F7FB",
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EEF1F7",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    date: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827"
    },
    badge: {
        fontSize: 12,
        fontWeight: "900",
        color: "#6B7280"
    },
    badgeGhost: {
        color: "#9e80c0"
    },
    badgeTier: {
        color: "#54a54a"
    },
    sub: {
        marginTop: 4,
        marginBottom: 10,
        color: "#6B7280",
        fontWeight: "600"
    },
    rowBox: {
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    label: {
        color: "#6B7280",
        fontWeight: "700",
        marginBottom: 4
    },
    value: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "800"
    },
});