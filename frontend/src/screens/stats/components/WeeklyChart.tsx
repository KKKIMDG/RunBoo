//frontend/src/screens/stats/components/WeeklyChart.tsx

import React, { useMemo } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import type { WeeklySummaryDto } from "@/types/record";
import { Colors } from "@/constants/theme";

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
    const colorScheme = useColorScheme() ?? "light";

    const styles = useMemo(() => {
        return getStyles(colorScheme);
    }, [colorScheme]);

    // ✅ 주간 총 러닝 횟수
    const totalRuns = weekly.items.reduce((sum, it) => sum + (it.runs ?? 0), 0);

    // ✅ 월~일 고정 7칸
    const points = new Array(7).fill(0);

    for (const it of weekly.items as any[]) {
        const idx = getMonStartIndex(it);
        if (idx === null) continue;

        points[idx] += (it.distanceM ?? 0) / 1000;
    }

    const max = Math.max(1, ...points);

    return (
        <View style={[styles.card, { marginTop: 12 }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.h}>이번 주</Text>
                <Text style={styles.sub}>총 {totalRuns}회</Text>
            </View>

            <View style={styles.chartRow}>
                {points.map((v, idx) => {
                    const ratio = v / max;
                    const barHeight = Math.max(
                        MIN_BAR_HEIGHT,
                        Math.round(ratio * CHART_HEIGHT)
                    );
                    const hasValue = v > 0;

                    return (
                        <View key={idx} style={styles.col}>
                            <View style={styles.barWrap}>
                                <View
                                    style={[
                                        styles.bar,
                                        !hasValue && styles.barZero,
                                        { height: barHeight },
                                    ]}
                                />
                            </View>

                            <View style={styles.labelWrap}>
                                <Text style={[styles.day, !hasValue && styles.dayZero]}>
                                    {DAYS[idx]}
                                </Text>
                                <Text style={[styles.km, !hasValue && styles.kmZero]}>
                                    {v.toFixed(1)}km
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        card: {
            backgroundColor: Colors[scheme].background,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        h: {
            color: Colors[scheme].text,
            fontWeight: "700",
            marginBottom: 10,
        },
        sub: {
            color: Colors[scheme].tabIconDefault,
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
            backgroundColor: Colors[scheme].primary,
        },
        barZero: {
            backgroundColor: Colors[scheme].disabled,
        },
        labelWrap: {
            marginTop: 8,
            alignItems: "center",
        },
        day: {
            fontWeight: "800",
            color: Colors[scheme].text,
        },
        dayZero: {
            color: Colors[scheme].subtext,
        },
        km: {
            marginTop: 2,
            fontSize: 11,
            color: Colors[scheme].text,
            fontWeight: "700",
        },
        kmZero: {
            color: Colors[scheme].tabIconDefault,
        },
    });
