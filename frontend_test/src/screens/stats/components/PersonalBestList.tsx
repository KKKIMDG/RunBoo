import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { PersonalBestsDto, RecordDto } from "@/types/record";
import { formatDate, formatDuration, formatKm, formatPace } from "@/screens/records/components/format";
import { Colors } from "@/constants/theme";

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    card: { 
        backgroundColor: Colors[scheme].card, 
        borderRadius: 18, 
        padding: 14, 
        borderWidth: 1, 
        borderColor: Colors[scheme].secondaryBackground 
    },
    h: { 
        fontSize: 16, 
        fontWeight: "900", 
        color: Colors[scheme].text, 
        marginBottom: 10 
    },
    row: {
        backgroundColor: Colors[scheme].secondaryBackground,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    rowTitle: { 
        color: Colors[scheme].icon, 
        fontWeight: "800" 
    },
    rowValue: { 
        marginTop: 6, 
        color: Colors[scheme].text, 
        fontSize: 18, 
        fontWeight: "900" 
    },
    rowDate: { 
        marginTop: 4, 
        color: Colors[scheme].icon, 
        fontWeight: "700", 
        fontSize: 12 
    },
});

function Row({ title, record, valueText, scheme }: { title: string; record: RecordDto | null; valueText: string, scheme: 'light' | 'dark' }) {
    const styles = getStyles(scheme);
    return (
        <View style={styles.row}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowValue}>{valueText}</Text>
            <Text style={styles.rowDate}>{record ? formatDate(record.startedAt) : "-"}</Text>
        </View>
    );
}

export default function PersonalBestList({ pb, scheme }: { pb: PersonalBestsDto, scheme: 'light' | 'dark' }) {
    const styles = getStyles(scheme);
    const longestDistance = pb.longestDistance;
    const longestDuration = pb.longestDuration;
    const bestPace = pb.bestPace;

    return (
        <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.h}>개인 기록</Text>

            <Row
                title="최장 거리"
                record={longestDistance}
                valueText={longestDistance ? formatKm(longestDistance.distanceM) : "-"}
                scheme={scheme}
            />
            <Row
                title="최장 시간"
                record={longestDuration}
                valueText={longestDuration ? formatDuration(longestDuration.durationSec) : "-"}
                scheme={scheme}
            />
            <Row
                title="최고 페이스"
                record={bestPace}
                valueText={bestPace ? formatPace(bestPace.avgPace) : "-"}
                scheme={scheme}
            />
        </View>
    );
}
