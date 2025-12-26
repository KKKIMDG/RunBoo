import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeeklySummaryDto } from "../../../types/record";

export default function WeeklyChart({ weekly }: { weekly: WeeklySummaryDto }) {
    // 간단하게 거리만 사용 (m -> km)
    const points = weekly.items.map((x) => x.distanceM / 1000);
    const max = Math.max(1, ...points);

    return (
        <View style={[s.card, { marginTop: 12 }]}>
            <View style={s.header}>
                <Text style={s.h}>주간 기록</Text>
                <Text style={s.sub}>이번 주</Text>
            </View>

            {/* 아주 단순한 “막대/라인 느낌” */}
            <View style={s.chartRow}>
                {points.map((v, idx) => {
                    const h = Math.round((v / max) * 70) + 6;
                    const day = ["월", "화", "수", "목", "금", "토", "일"][idx] ?? "";
                    return (
                        <View key={idx} style={s.col}>
                            <View style={[s.bar, { height: h }]} />
                            <Text style={s.day}>{day}</Text>
                            <Text style={s.km}>{v.toFixed(1)}km</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#EEF1F7"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center" },
    h: {
        fontSize: 16,
        fontWeight: "900",
        color: "#111827"
    },
    sub: {
        color: "#6B7280",
        fontWeight: "700"
    },
    chartRow: {
        flexDirection: "row",
        marginTop: 12,
        justifyContent: "space-between"
    },
    col: {
        width: 40,
        alignItems: "center"},
    bar: {
        width: 10,
        borderRadius: 6,
        backgroundColor: "#2F4BFF" },
    day: {
        marginTop: 8,
        fontWeight: "800",
        color: "#111827" },
    km: {
        marginTop: 2,
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "700" },
});
