//frontend/src/screens/stats/components/WeeklyChart.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeeklySummaryDto } from "@/types/record";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const CHART_HEIGHT = 74;
const MIN_BAR_HEIGHT = 2;

function getMonStartIndex(item: any): number | null {
    if (item?.date) {
        const d = new Date(item.date);
        if (!Number.isNaN(d.getTime())) {
            return (d.getDay() + 6) % 7;
        }
    }
    return null;
}

export default function WeeklyChart({ weekly }: { weekly: WeeklySummaryDto }) {
    // ✅ 주간 총 러닝 횟수
    const totalRuns = weekly.items.reduce(
        (sum, it) => sum + (it.runs ?? 0),
        0
    );

    // ✅ 월~일 고정 7칸
    const points = new Array(7).fill(0);

    for (const it of weekly.items as any[]) {
        const idx = getMonStartIndex(it);
        if (idx === null) continue;

        points[idx] += (it.distanceM ?? 0) / 1000;
    }

    const max = Math.max(1, ...points);

    return (
        <View style={[s.card, { marginTop: 12 }]}>
            {/* 헤더 */}
            <View style={s.header}>
                <Text style={s.h}>이번 주</Text>
                <Text style={s.sub}>총 {totalRuns}회</Text>
            </View>

            <View style={s.chartRow}>
                {points.map((v, idx) => {
                    const ratio = v / max;
                    const barHeight = Math.max(
                        MIN_BAR_HEIGHT,
                        Math.round(ratio * CHART_HEIGHT)
                    );
                    const hasValue = v > 0;

                    return (
                        <View key={idx} style={s.col}>
                            <View style={s.barWrap}>
                                <View style={[s.bar,
                                    !hasValue && s.barZero,
                                    { height: barHeight }]} />
                            </View>

                            <View style={s.labelWrap}>
                                <Text style={[s.day, !hasValue && s.dayZero]}>{DAYS[idx]}</Text>
                                <Text style={[s.km, !hasValue && s.kmZero]}>{v.toFixed(1)}km</Text>
                            </View>
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
        borderColor: "#EEF1F7",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    h: {
        color: "#000",
        fontWeight: "700",
        marginBottom: 10,
    },
    sub: {
        color: "#6B7280",
        fontWeight: "600",
        marginBottom: 10,
    },
    chartRow: {
        flexDirection: "row",
        marginTop: 12,
        justifyContent: "space-between",
    },
    col: {
        width: 40,
        alignItems: "center",
    },
    barWrap: {
        height: CHART_HEIGHT,
        width: 40,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    bar: {
        width: 10,
        borderRadius: 6,
        backgroundColor: "#3A4A98",
    },
    barZero: {
        backgroundColor: "#D1D5DB",
    },
    labelWrap: {
        marginTop: 8,
        alignItems: "center",
    },
    day: {
        fontWeight: "800",
        color: "#111827",
    },
    dayZero: {
        color: "#9CA3AF",
    },
    km: {
        marginTop: 2,
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "700",
    },
    kmZero: {
        color: "#9CA3AF",
    },
});
