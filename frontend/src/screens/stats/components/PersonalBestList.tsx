//frontend/src/screens/stats/components/PersonalBestList.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { PersonalBestsDto, RecordDto } from "../../../types/record";
import {
    formatDate,
    formatDuration,
    formatKm,
    formatPace,
} from "../../records/components/format";

function Row({
                 title,
                 record,
                 valueText,
                 accentColor,
             }: {
    title: string;
    record: RecordDto | null;
    valueText: string;
    accentColor: string;
}) {
    return (
        <View style={s.row}>
            {/* ✅ 왼쪽 끝 포인트 컬러 */}
            <View style={[s.accent, { backgroundColor: accentColor }]} />

            {/* 좌측(제목 + 값) */}
            <View style={s.left}>
                <Text style={s.rowTitle}>{title}</Text>
                <Text style={s.rowValue}>{valueText}</Text>
            </View>

            {/* 우측(날짜) */}
            <Text style={s.rowDate}>
                {record ? formatDate(record.startedAt) : "-"}
            </Text>
        </View>
    );
}

export default function PersonalBestList({ pb }: { pb: PersonalBestsDto }) {
    const longestDistance = pb.longestDistance;
    const longestDuration = pb.longestDuration;
    const bestPace = pb.bestPace;

    return (
        <View style={[s.card, { marginTop: 12 }]}>
            <Text style={s.h}>개인 기록</Text>

            <Row
                title="최장 거리"
                record={longestDistance}
                valueText={longestDistance ? formatKm(longestDistance.distanceM) : "-"}
                accentColor="#2F4AA0"
            />
            <Row
                title="최고 속도"
                record={bestPace}
                valueText={bestPace ? "23.3 km/h" : "-"}
                accentColor="#111827"
            />
            <Row
                title="최장 시간"
                record={longestDuration}
                valueText={longestDuration ? formatDuration(longestDuration.durationSec) : "-"}
                accentColor="#2F4AA0"
            />
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
    h: {
        fontSize: 16,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 10,
    },
    row: {
        backgroundColor: "#F2F3F5",
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
        color: "#6B7280",
        fontWeight: "600",
    },
    rowValue: {
        marginTop: 6,
        color: "#111827",
        fontSize: 21,
        fontWeight: "900",
    },
    rowDate: {
        color: "#9CA3AF",
        fontWeight: "600",
        fontSize: 12,
        textAlign: "right",
    },
});
