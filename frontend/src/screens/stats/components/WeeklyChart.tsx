import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WeeklySummaryDto } from "../../../types/record";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

// ✅ 막대가 그려질 “그래프 영역”의 고정 높이
const CHART_HEIGHT = 74;
// ✅ 0km여도 보이는 최소 막대 높이
const MIN_BAR_HEIGHT = 6;

/**
 * item에서 "이게 무슨 요일인지"를 뽑아내서
 * 월(0) ~ 일(6) 인덱스로 변환해주는 함수
 */
function getMonStartIndex(item: any): number | null {
    // 1) item.date 같은 ISO 날짜 문자열
    if (item?.date) {
        const d = new Date(item.date);
        if (!Number.isNaN(d.getTime())) {
            // JS getDay(): 일0 월1 ... 토6 -> 월0 ... 일6
            return (d.getDay() + 6) % 7;
        }
    }

    // 2) item.dayOfWeek가 1~7 (월1 ... 일7)
    if (typeof item?.dayOfWeek === "number") {
        const v = item.dayOfWeek;
        if (v >= 1 && v <= 7) return v - 1;
    }

    // 3) item.dayOfWeek가 0~6 (일0 ... 토6)
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

        // 같은 요일에 기록이 여러 개면 합산
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
                    const ratio = v / max;
                    const barHeight = Math.max(MIN_BAR_HEIGHT, Math.round(ratio * CHART_HEIGHT));
                    const day = DAYS[idx];

                    return (
                        <View key={idx} style={s.col}>
                            {/* ✅ 그래프 영역: 높이 고정 + 아래에서 위로 자라게 */}
                            <View style={s.barWrap}>
                                <View style={[s.bar, { height: barHeight }]} />
                            </View>

                            {/* ✅ 라벨 영역: 항상 같은 위치 */}
                            <View style={s.labelWrap}>
                                <Text style={s.day}>{day}</Text>
                                <Text style={s.km}>{v.toFixed(1)}km</Text>
                            </View>
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

    // ✅ 막대가 그려지는 영역: 높이 고정 + 바닥 정렬
    barWrap: {
        height: CHART_HEIGHT,
        width: 40,
        alignItems: "center",
        justifyContent: "flex-end",
    },

    bar: {
        width: 10,
        borderRadius: 6,
        backgroundColor: "#2F4BFF",
    },

    // ✅ 라벨 영역도 따로 묶어서 항상 같은 위치
    labelWrap: {
        marginTop: 8,
        alignItems: "center",
    },

    day: {
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