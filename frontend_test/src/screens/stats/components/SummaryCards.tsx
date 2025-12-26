import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { MonthlySummaryDto } from "@/types/record";
import { Colors } from "@/constants/theme";

function km(m: number) {
    return (m / 1000).toFixed(0);
}
function hours(sec: number) {
    return Math.floor(sec / 3600);
}

const styles = StyleSheet.create({
    card: { 
        backgroundColor: Colors.light.card, 
        borderRadius: 18, 
        padding: 14, 
        borderWidth: 1, 
        borderColor: Colors.light.secondaryBackground 
    },
    h: { 
        fontSize: 16, 
        fontWeight: "900", 
        color: Colors.light.text 
    },
    sub: { 
        marginTop: 4, 
        color: Colors.light.icon, 
        fontWeight: "600" 
    },
    grid: { 
        flexDirection: "row", 
        gap: 10, 
        marginTop: 12 
    },
    box: { 
        flex: 1, 
        backgroundColor: Colors.light.secondaryBackground, 
        borderRadius: 14, 
        padding: 12 
    },
    boxLabel: { 
        color: Colors.light.icon, 
        fontWeight: "700" 
    },
    boxValue: { 
        marginTop: 6, 
        fontSize: 22, 
        fontWeight: "900", 
        color: Colors.light.text 
    },
    boxUnit: { 
        marginTop: 2, 
        color: Colors.light.icon, 
        fontWeight: "700" 
    },
});

export default function SummaryCards({ monthly }: { monthly: MonthlySummaryDto }) {
    return (
        <View style={styles.card}>
            <Text style={styles.h}>이번달 총 기록</Text>
            <Text style={styles.sub}>총 {monthly.totalRuns}회</Text>

            <View style={styles.grid}>
                <View style={styles.box}>
                    <Text style={styles.boxLabel}>총 거리</Text>
                    <Text style={styles.boxValue}>{km(monthly.totalDistanceM)}</T ext>
                    <Text style={styles.boxUnit}>km</Text>
                </View>
                <View style={styles.box}>
                    <Text style={styles.boxLabel}>총 시간</Text>
                    <Text style={styles.boxValue}>{hours(monthly.totalDurationSec)}</Text>
                    <Text style={styles.boxUnit}>시간</Text>
                </View>
                <View style={styles.box}>
                    <Text style={styles.boxLabel}>칼로리</Text>
                    <Text style={styles.boxValue}>{Math.round(monthly.totalCalories)}</Text>
                    <Text style={styles.boxUnit}>kcal</Text>
                </View>
            </View>
        </View>
    );
}