import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { PersonalBestsDto, RecordDto } from "../../../types/record";
import { formatDate, formatDuration, formatKm, formatPace } from "../../records/components/format";

function Row({ title, record, valueText }: { title: string; record: RecordDto | null; valueText: string }) {
    return (
        <View style={s.row}>
            <Text style={s.rowTitle}>{title}</Text>
            <Text style={s.rowValue}>{valueText}</Text>
            <Text style={s.rowDate}>{record ? formatDate(record.startedAt) : "-"}</Text>
        </View>
    );
}

export default function PersonalBestList({ pb }: { pb: PersonalBestsDto }) {
    const longestDistance = pb.longestDistance;
    const longestDuration = pb.longestDuration;
    console.log("🔥 longestDuration raw =", pb.longestDuration);
    const bestPace = pb.bestPace;

    return (
        <View style={[s.card, { marginTop: 12 }]}>
            <Text style={s.h}>개인 기록</Text>

            <Row
                title="최장 거리"
                record={longestDistance}
                valueText={longestDistance ? formatKm(longestDistance.distanceM) : "-"}
            />
            <Row
                title="최장 시간"
                record={longestDuration}
                valueText={longestDuration ? formatDuration(longestDuration.durationSec) : "-"}
            />
            <Row
                title="최고 페이스"
                record={bestPace}
                valueText={bestPace ? formatPace(bestPace.avgPace) : "-"}
            />
        </View>
    );
}

const s = StyleSheet.create({
    card: { backgroundColor: "white", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#EEF1F7" },
    h: { fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 10 },
    row: {
        backgroundColor: "#F7F8FC",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    rowTitle: { color: "#6B7280", fontWeight: "800" },
    rowValue: { marginTop: 6, color: "#111827", fontSize: 18, fontWeight: "900" },
    rowDate: { marginTop: 4, color: "#6B7280", fontWeight: "700", fontSize: 12 },
});