// frontend/src/screens/stats/components/PersonalBestList.tsx

import React, { useMemo } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import type { PersonalBestsDto, RecordDto } from "@/types/record";
import { Colors } from "@/constants/theme";
import {
    formatDate,
    formatDuration,
    formatKm,
    formatPace,
} from "../../records/components/format";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";
import {useSettings} from "@/screens/Settings/useSettings";

function Row({
                 title,
                 record,
                 valueText,
                 accentColor,
                 styles,
             }: {
    title: string;
    record: RecordDto | null;
    valueText: string;
    accentColor: string;
    styles: ReturnType<typeof getStyles>;
}) {
    return (
        <View style={styles.row}>
            {/* 왼쪽 포인트 컬러 */}
            <View style={[styles.accent, { backgroundColor: accentColor }]} />

            {/* 왼쪽 영역 (제목 + 날짜) */}
            <View style={styles.left}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowDate}>
                    {record ? formatDate(record.startedAt) : "-"}
                </Text>
            </View>

            {/* 오른쪽 영역 (값) */}
            <Text style={styles.rowValueRight}>{valueText}</Text>
        </View>
    );
}

export default function PersonalBestList({ pb }: { pb: PersonalBestsDto }) {
    const { settings } = useSettings();
    const colorScheme = useColorScheme() ?? "light";
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const longestDistance = pb.longestDistance;
    const longestDuration = pb.longestDuration;
    const bestPace = pb.bestPace;

    return (
        <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.h}>최고 기록</Text>

            <Row
                title="최장 거리"
                record={longestDistance}
                valueText={longestDistance ? formatKm(longestDistance.distanceM) : "-"}
                accentColor={Colors[colorScheme].primary}
                styles={styles}
            />

            <Row
                title="최고 페이스"
                record={bestPace}
                valueText={
                    bestPace && bestPace.avgPace != null ? formatPace(bestPace.avgPace) : "-"
                }
                accentColor={Colors[colorScheme].text}
                styles={styles}
            />

            <Row
                title="최장 시간"
                record={longestDuration}
                valueText={
                    longestDuration ? formatDuration(longestDuration.durationSec) : "-"
                }
                accentColor={Colors[colorScheme].primary}
                styles={styles}
            />
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
        h: {
            color: Colors[scheme].text,
            fontWeight: "700",
            marginBottom: 14,
        },
        row: {
            backgroundColor: Colors[scheme].card,
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 14,
            marginTop: 10,

            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",

            position: "relative",
            overflow: "hidden",
        },
        accent: {
            position: "absolute",
            left: 0,
            top: 8,
            bottom: 8,
            width: 5,
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
        },
        left: {
            flex: 1,
            paddingLeft: 6,
            paddingRight: 10,
        },
        rowTitle: {
            color: Colors[scheme].text,
            fontWeight: "600",
        },
        rowDate: {
            marginTop: 6,
            color: Colors[scheme].tabIconDefault,
            fontWeight: "600",
            fontSize: scaleFont(12, fontSize),
        },
        rowValueRight: {
            color: Colors[scheme].primary,
            fontSize: scaleFont(20, fontSize),
            fontWeight: "800",
            textAlign: "right",
        },
    });
