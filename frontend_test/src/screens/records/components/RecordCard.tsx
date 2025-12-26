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
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors[sc].secondaryBackground,
        },
        header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        date: { fontSize: 16, fontWeight: "800", color: Colors[sc].text },
        badge: { fontSize: 12, color: Colors[sc].icon, fontWeight: "700" },
        sub: { marginTop: 4, marginBottom: 10, color: Colors[sc].icon },
        rowBox: {
            backgroundColor: Colors[sc].secondaryBackground,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginTop: 8,
        },
        label: { color: Colors[sc].icon, fontWeight: "700", marginBottom: 4 },
        value: { color: Colors[sc].text, fontSize: 18, fontWeight: "900" },
    });
};

export default function RecordCard({ item, scheme }: { item: RecordDto; scheme?: Scheme }) {
    const styles = getStyles(scheme);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
                <Text style={styles.badge}>
                    {item.mode === "GHOST" ? "고스트" : item.mode === "TIER" ? "티어 측정" : "일반 측정"}
                </Text>
            </View>

            <Text style={styles.sub}>{formatTimeRange(item.startedAt, item.endedAt)}</Text>

            <View style={styles.rowBox}>
                <Text style={styles.label}>러닝 거리</Text>
                <Text style={styles.value}>{formatKm(item.distanceM)}</Text>
            </View>

            <View style={styles.rowBox}>
                <Text style={styles.label}>평균 페이스</Text>
                <Text style={styles.value}>{formatPace(item.avgPace)}</Text>
            </View>

            <View style={styles.rowBox}>
                <Text style={styles.label}>러닝 시간</Text>
                <Text style={styles.value}>{formatDurationFromRange(item.startedAt, item.endedAt)}</Text>
            </View>
        </View>
    );
}
