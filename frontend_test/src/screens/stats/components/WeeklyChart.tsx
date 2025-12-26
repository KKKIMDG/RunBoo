import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeeklySummaryDto } from "@/types/record";
import { Colors } from "@/constants/theme";

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    card: { 
        backgroundColor: Colors[scheme].card, 
        borderRadius: 18, 
        padding: 14, 
        borderWidth: 1, 
        borderColor: Colors[scheme].secondaryBackground 
    },
    header: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center" 
    },
    h: { 
        fontSize: 16, 
        fontWeight: "900", 
        color: Colors[scheme].text 
    },
    sub: { 
        color: Colors[scheme].icon, 
        fontWeight: "700" 
    },
    chartRow: { 
        flexDirection: "row", 
        marginTop: 12, 
        justifyContent: "space-between" 
    },
    col: { 
        width: 40, 
        alignItems: "center" 
    },
    bar: { 
        width: 10, 
        borderRadius: 6, 
        backgroundColor: Colors[scheme].primary
    },
    day: { 
        marginTop: 8, 
        fontWeight: "800", 
        color: Colors[scheme].text 
    },
    km: { 
        marginTop: 2, 
        fontSize: 11, 
        color: Colors[scheme].icon, 
        fontWeight: "700" 
    },
});

export default function WeeklyChart({ weekly, scheme }: { weekly: WeeklySummaryDto, scheme: 'light' | 'dark' }) {
    const styles = getStyles(scheme);
    // 간단하게 거리만 사용 (m -> km)
    const points = weekly.items.map((x) => x.distanceM / 1000);
    const max = Math.max(1, ...points);

    return (
        <View style={[styles.card, { marginTop: 12 }]}>
            <View style={styles.header}>
                <Text style={styles.h}>주간 기록</Text>
                <Text style={styles.sub}>이번 주</Text>
            </View>

            {/* 아주 단순한 “막대/라인 느낌” */}
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