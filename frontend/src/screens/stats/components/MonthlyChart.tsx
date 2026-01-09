//frontend/src/screens/stats/components/MonthlyChart.tsx

import React, {useMemo} from "react";
import {View, Text, StyleSheet, useColorScheme} from "react-native";
import type { MonthlySummaryDto } from "@/types/record";

function km(m: number) {
    return (m / 1000).toFixed(2);
}

function hours(sec: number) {
    return (sec / 3600).toFixed(1);
}

export default function MonthlyChart({ monthly }: { monthly: MonthlySummaryDto }) {

    const colorScheme = useColorScheme() ?? "light";

    const styles = useMemo(() => {
        return getStyles(colorScheme);
    }, [colorScheme]);

    return (
        <View style={styles.card}>
            {/* 헤더 영역 */}
            <View style={styles.headerRow}>
                <Text style={styles.h}>이번 달</Text>
                <Text style={styles.sub}>총 {monthly.totalRuns}회</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.box}>
                    <Text style={styles.boxLabel}>거리</Text>
                    <Text style={styles.boxValue1}>{km(monthly.totalDistanceM)}</Text>
                    <Text style={styles.boxUnit}>km</Text>
                </View>
                <View style={styles.box}>
                    <Text style={styles.boxLabel}>시간</Text>
                    <Text style={styles.boxValue2}>{hours(monthly.totalDurationSec)}</Text>
                    <Text style={styles.boxUnit}>시간</Text>
                </View>
                <View style={styles.box}>
                    <Text style={styles.boxLabel}>칼로리</Text>
                    <Text style={styles.boxValue1}>{Math.round(monthly.totalCalories)}</Text>
                    <Text style={styles.boxUnit}>kcal</Text>
                </View>
            </View>
        </View>
    );
}

export const getStyles = (scheme: "light" | "dark" ) =>
    StyleSheet.create({
    card: {
        backgroundColor: "#F5F7FB",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#EEF1F7",
    },
    headerRow: {
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
    grid: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    box: {
        flex: 1,
        backgroundColor: "#FFF",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
    },
    boxLabel: {
        color: "#9CA3AF",
        fontWeight: "600",
    },
    boxValue1: {
        marginTop: 6,
        fontSize: 25,
        fontWeight: "900",
        color: "#3A4A98",
    },
    boxValue2: {
        marginTop: 6,
        fontSize: 25,
        fontWeight: "900",
        color: "#111827",
    },
    boxUnit: {
        marginTop: 2,
        color: "#9CA3AF",
        fontWeight: "500",
    },
});
