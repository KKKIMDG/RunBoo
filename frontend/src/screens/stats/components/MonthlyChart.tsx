//frontend/src/screens/stats/components/MonthlyChart.tsx

import React, {useMemo} from "react";
import {View, Text, StyleSheet } from "react-native";
import type { MonthlySummaryDto } from "@/types/record";
import {Colors} from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

function km(m: number) {
    return (m / 1000).toFixed(2);
}

function hours(sec: number) {
    return (sec / 3600).toFixed(1);
}

export default function MonthlyChart({ monthly }: { monthly: MonthlySummaryDto }) {

    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

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

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
    StyleSheet.create({
    card: {
        backgroundColor: Colors[scheme].background,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors[scheme].border,
    },
    headerRow: {
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
    grid: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    box: {
        flex: 1,
        backgroundColor: Colors[scheme].secondaryBackground,
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
    },
    boxLabel: {
        color: Colors[scheme].tabIconDefault,
        fontWeight: "600",
    },
    boxValue1: {
        marginTop: 6,
        fontSize:  scaleFont(25, fontSize),
        fontWeight: "900",
        color: Colors[scheme].primary,
    },
    boxValue2: {
        marginTop: 6,
        fontSize:  scaleFont(25, fontSize),
        fontWeight: "900",
        color: Colors[scheme].primary,
    },
    boxUnit: {
        marginTop: 2,
        color: Colors[scheme].tabIconDefault,
        fontWeight: "500",
    },
});
