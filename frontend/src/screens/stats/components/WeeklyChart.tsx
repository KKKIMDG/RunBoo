import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeeklySummaryDto } from "../../../types/record";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * item에서 "이게 무슨 요일인지"를 뽑아내서
 * 월(0) ~ 일(6) 인덱스로 변환해주는 함수
 *
 * ✅ 아래 3가지 중 너희 백엔드 DTO에 맞는 케이스 하나만 살아있어도 동작함
 */
function getMonStartIndex(item: any): number | null {
    // 1) item.date 같은 ISO 날짜 문자열이 오는 경우 (가장 흔함)
    //    예: "2025-12-26" 또는 "2025-12-26T10:00:00"
    if (item?.date) {
        const d = new Date(item.date);
        if (!Number.isNaN(d.getTime())) {
            // JS getDay(): 일0 월1 화2 ... 토6  -> 월0 ... 일6 로 변환
            return (d.getDay() + 6) % 7;
        }
    }

    // 2) item.dayOfWeek가 1~7 (월1 ... 일7) 로 오는 경우
    if (typeof item?.dayOfWeek === "number") {
        const v = item.dayOfWeek;
        if (v >= 1 && v <= 7) return v - 1;
    }

    // 3) item.dayOfWeek가 0~6 (일0 ... 토6) 로 오는 경우
    if (typeof item?.dayOfWeek === "number") {
        const v = item.dayOfWeek;
        if (v >= 0 && v <= 6) return (v + 6) % 7;
    }

    return null;
}

export default function WeeklyChart({ weekly }: { weekly: WeeklySummaryDto }) {
    // ✅ 월~일 7칸 고정
    const points = new Array(7).fill(0);

    // ✅ weekly.items를 해당 요일 칸에 끼워 넣기
    for (const it of weekly.items as any[]) {
        const idx = getMonStartIndex(it);
        if (idx === null) continue;

        // 같은 요일에 기록이 여러 개면 합산(원하면 "마지막 값"으로 덮어쓰기 등으로 바꿔도 됨)
        points[idx] += (it.distanceM ?? 0) / 1000;
    }

    const max = Math.max(1, ...points);

    return (
        <View style={[s.card, { marginTop: 12 }]}>
            <View style={s.header}>
                <Text style={s.h}>주간 기록</Text>
                <Text style={s.sub}>이번 주</Text>
            </View>

            <View style={s.chartRow}>
                {points.map((v, idx) => {
                    const h = Math.round((v / max) * 70) + 6; // v=0이어도 최소 높이 유지
                    const day = DAYS[idx];

                    return (
                        <View key={idx} style={s.col}>
                            <View style={[s.bar, { height: h }]} />
                            <Text style={s.day}>{day}</Text>
                            <Text style={s.km}>{v.toFixed(1)}km</Text>
                        </View>
                    );
                })}
            </View>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    h: {
        fontSize: 16,
        fontWeight: "900",
        color: "#111827",
    },
    sub: {
        color: "#6B7280",
        fontWeight: "700",
    },
    chartRow: {
        flexDirection: "row",
        marginTop: 12,
        justifyContent: "space-between",
    },
    col: {
        width: 40,
        alignItems: "center",
    },
    bar: {
        width: 10,
        borderRadius: 6,
        backgroundColor: "#2F4BFF",
    },
    day: {
        marginTop: 8,
        fontWeight: "800",
        color: "#111827",
    },
    km: {
        marginTop: 2,
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "700",
    },
});
