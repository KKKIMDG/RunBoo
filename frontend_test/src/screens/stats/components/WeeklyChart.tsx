import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeeklySummaryDto } from "@/types/record";
import { Colors } from "@/constants/theme";

type Scheme = "light" | "dark";
const norm = (s?: Scheme): Scheme => (s === "dark" ? "dark" : "light");

const getStyles = (scheme?: Scheme) => {
    const sc = norm(scheme);
    return StyleSheet.create({
        card: {
            backgroundColor: Colors[sc].card,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: Colors[sc].secondaryBackground,
        },
        header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        h: { fontSize: 16, fontWeight: "900", color: Colors[sc].text },
        sub: { color: Colors[sc].icon, fontWeight: "700" },
        chartRow: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
        col: { width: 40, alignItems: "center" },
        bar: { width: 10, borderRadius: 6, backgroundColor: Colors[sc].primary },
        day: { marginTop: 8, fontWeight: "800", color: Colors[sc].text },
        km: { marginTop: 2, fontSize: 11, color: Colors[sc].icon, fontWeight: "700" },
    });
};

export default function WeeklyChart({ weekly, scheme }: { weekly: WeeklySummaryDto; scheme?: Scheme }) {
    const styles = getStyles(scheme);
    const points = weekly.items.map((x) => x.distanceM / 1000);
    const max = Math.max(1, ...points);

    return (
        <View style={[styles.card, { marginTop: 12 }]}>
            <View style={styles.header}>
                <Text style={styles.h}>주간 기록</Text>
                <Text style={styles.sub}>이번 주</Text>
            </View>

            <View style={styles.chartRow}>
                {points.map((v, idx) => {
                    const h = Math.round((v / max) * 70) + 6;
                    const day = ["월", "화", "수", "목", "금", "토", "일"][idx] ?? "";
                    return (
                        <View key={idx} style={styles.col}>
                            <View style={[styles.bar, { height: h }]} />
                            <Text style={styles.day}>{day}</Text>
                            <Text style={styles.km}>{v.toFixed(1)}km</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
