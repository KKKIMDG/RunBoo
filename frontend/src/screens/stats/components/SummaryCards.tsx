import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { MonthlySummaryDto } from "@/types/record";

function km(m: number) {
    return (m / 1000).toFixed(2);
}

function hours(sec: number) {
    return (sec / 3600).toFixed(1);
}

export default function SummaryCards({ monthly }: { monthly: MonthlySummaryDto }) {
    return (
        <View style={s.card}>
            <Text style={s.h}>이번달 총 기록</Text>
            <Text style={s.sub}>총 {monthly.totalRuns}회</Text>

            <View style={s.grid}>
                <View style={s.box}>
                    <Text style={s.boxLabel}>총 거리</Text>
                    <Text style={s.boxValue1}>{km(monthly.totalDistanceM)}</Text>
                    <Text style={s.boxUnit}>km</Text>
                </View>
                <View style={s.box}>
                    <Text style={s.boxLabel}>총 시간</Text>
                    <Text style={s.boxValue2}>{hours(monthly.totalDurationSec)}</Text>
                    <Text style={s.boxUnit}>시간</Text>
                </View>
                <View style={s.box}>
                    <Text style={s.boxLabel}>칼로리</Text>
                    <Text style={s.boxValue1}>{Math.round(monthly.totalCalories)}</Text>
                    <Text style={s.boxUnit}>kcal</Text>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: { backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#EEF1F7" },
    h: { fontSize: 16, fontWeight: "900", color: "#111827" },
    sub: { marginTop: 4, color: "#6B7280", fontWeight: "600" },
    grid: { flexDirection: "row", gap: 10, marginTop: 12 },
    box: { flex: 1, backgroundColor: "#F7F8FC", borderRadius: 14, padding: 12 },
    boxLabel: { color: "#6B7280", fontWeight: "700" },
    boxValue1: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#3A4A98" },
    boxValue2: { marginTop: 6, fontSize: 22, fontWeight: "900", color: "#111827" },
    boxUnit: { marginTop: 2, color: "#6B7280", fontWeight: "700" },
});