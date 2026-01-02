// frontend/src/screens/ghost/GhostRunScreen.tsx

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useGhostRunScreen } from "./useGhostRunScreen";

const { width: W } = Dimensions.get("window");

type IoniconName =
    | "volume-high-outline"
    | "volume-mute-outline"
    | "pause"
    | "play"
    | "stop"
    | "analytics-outline"
    | "medal-outline"
    | "glasses-sharp";

export default function GhostRunScreen() {
    const scheme = (useColorScheme() ?? "light") as "light" | "dark";
    const base = Colors[scheme] as any;

    const colors = {
        background: "#F5F6F8",
        headerBg: "#FFFFFF",
        card: "#FFFFFF",
        text: base?.text ?? "#111111",
        text2: base?.text2 ?? "#222",
        primary: base?.primary ?? "#2F3A8F",
        border: "#E5E7EB",
        mutedText: base?.mutedText ?? base?.subtext ?? "#6B7280",
        danger: "#ff3b30",
    };

    const [isSoundOn, setIsSoundOn] = useState(true);

    const { state, actions, utils } = useGhostRunScreen();
    const {
        isReady,
        countdown,
        isPaused,
        time,
        distanceM,
        currentPaceSec,
        ghostDistanceM,
        ghostTotalDistanceM,
        paceHistoryMin,
    } = state;

    const { pauseRun, resumeRun, stopRun } = actions;
    const { formatTime, formatPace, formatDiffBadge } = utils;

    const totalKm = ghostTotalDistanceM > 0 ? ghostTotalDistanceM / 1000 : 0;

    const youRatio =
        ghostTotalDistanceM > 0 ? Math.max(0, Math.min(1, distanceM / ghostTotalDistanceM)) : 0;
    const ghostRatio =
        ghostTotalDistanceM > 0
            ? Math.max(0, Math.min(1, ghostDistanceM / ghostTotalDistanceM))
            : 0;

    const youKmText = (distanceM / 1000).toFixed(2);
    const ghostKmText = (ghostDistanceM / 1000).toFixed(2);

    const midKm = totalKm > 0 ? totalKm / 2 : 0;
    const markRight = totalKm > 0 ? `${totalKm.toFixed(1)}km` : "-";
    const markMid = totalKm > 0 ? `${midKm.toFixed(1)}km` : "-";

    /**
     * ✅ "처음~현재" 전 구간 누적 그래프
     * - paceHistoryMin이 제자리 push로 바뀌어도 상관없이
     * - 우리가 rtPaceData를 누적 append로 직접 관리
     *
     * 전략:
     * 1) time이 0(또는 매우 작음)으로 리셋되면 새 러닝 시작으로 판단하고 rtPaceData 초기화
     * 2) 매 틱마다 "현재 페이스(currentPaceSec)"를 그래프 배열 끝에 추가
     *    (단, 같은 값이 너무 잦은 틱으로 중복되면 계단처럼 길어지므로, 직전 값과 같으면 스킵)
     * 3) 최소 2포인트 보장 (chart-kit용)
     */
    const [rtPaceData, setRtPaceData] = useState<number[]>([0, 0]);
    const lastAddedRef = useRef<number | null>(null);
    const startedRef = useRef(false);

    // ✅ 러닝 "새로 시작" 감지: time이 0 근처로 내려가면 초기화
    useEffect(() => {
        // time이 초 단위라고 가정. (formatTime(time) 쓰는 걸 보면 보통 초)
        if (time <= 0) {
            startedRef.current = false;
            lastAddedRef.current = null;
            setRtPaceData([0, 0]);
        }
    }, [time]);

    // ✅ 실시간 누적 append
    useEffect(() => {
        // 카운트다운/준비 중에는 append 하지 않게
        if (isReady) return;

        // 러닝이 "처음 시작"되는 순간 한 번만 상태 전환
        if (!startedRef.current && time > 0) {
            startedRef.current = true;
        }

        // 일시정지면 그래프를 멈춘다(원하면 이 if 제거하면, 멈춘 동안에도 같은 값이 계속 쌓일 수 있음)
        if (isPaused) return;

        // 현재 페이스 유효성 체크
        const pace = typeof currentPaceSec === "number" ? currentPaceSec : Number(currentPaceSec);
        if (!Number.isFinite(pace) || pace <= 0) return;

        // 너무 촘촘한 중복 방지: 직전 값과 완전히 같으면 스킵
        if (lastAddedRef.current !== null && lastAddedRef.current === pace) return;

        lastAddedRef.current = pace;

        setRtPaceData((prev) => {
            // 초기 [0,0] 상태면 2포인트로 시작
            if (prev.length <= 2 && prev[0] === 0 && prev[1] === 0) {
                return [pace, pace];
            }
            return [...prev, pace];
        });
    }, [isReady, isPaused, time, currentPaceSec]);

    /**
     * ✅ 만약 paceHistoryMin이 “진짜 기록 배열”이라면,
     * 러닝 종료 후(또는 중간)에도 거기 값이 더 신뢰할만할 수 있어서
     * paceHistoryMin이 더 길어졌을 때는 rtPaceData를 그걸로 "동기화"해주는 옵션을 넣어둠.
     * (제자리 push여도 길이만 늘어나면 감지 가능)
     */
    const lastLenRef = useRef<number>(0);
    useEffect(() => {
        if (!Array.isArray(paceHistoryMin)) return;

        const len = paceHistoryMin.length;
        if (len <= 0) return;

        // 길이가 늘었을 때만 반영 (제자리 push라도 length는 늘어나니까 감지됨)
        if (len > lastLenRef.current) {
            lastLenRef.current = len;

            const cleaned = [...paceHistoryMin]
                .map((v) => (typeof v === "number" ? v : Number(v)))
                .filter((v) => Number.isFinite(v) && v > 0);

            if (cleaned.length >= 2) {
                setRtPaceData(cleaned);
                lastAddedRef.current = cleaned[cleaned.length - 1] ?? lastAddedRef.current;
            } else if (cleaned.length === 1) {
                setRtPaceData([cleaned[0], cleaned[0]]);
                lastAddedRef.current = cleaned[0];
            }
        }
    }, [paceHistoryMin, time]);

    // ✅ chart-kit 캐시 깨기 (누적 그래프라 key는 길이 기반으로 충분)
    const chartKey = useMemo(() => {
        const last = rtPaceData.length ? rtPaceData[rtPaceData.length - 1] : 0;
        return `pace-${rtPaceData.length}-${last}`;
    }, [rtPaceData]);

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(44, 63, 110, ${opacity})`,
        labelColor: (opacity = 1) =>
            scheme === "dark" ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: "0" },
        propsForBackgroundLines: { stroke: "rgba(0,0,0,0.08)" },
    };

    const chartData = useMemo(
        () => ({
            // ✅ "시작~현재"를 가로축 전체로 쓰므로 라벨은 숨김 처리(빈 값)
            labels: rtPaceData.map(() => ""),
            datasets: [
                {
                    data: rtPaceData,
                    color: (opacity = 1) => `rgba(44, 63, 110, ${opacity})`,
                    strokeWidth: 3,
                },
            ],
        }),
        [rtPaceData]
    );

    /**
     * ✅ 목표 거리 도달 시 자동 정지 (딱 1번만)
     */
    const stoppedRef = useRef(false);

    useEffect(() => {
        if (stoppedRef.current) return;
        if (!ghostTotalDistanceM || ghostTotalDistanceM <= 0) return;

        if (!isPaused && distanceM >= ghostTotalDistanceM) {
            stoppedRef.current = true;
            stopRun();
        }
    }, [distanceM, ghostTotalDistanceM, isPaused, stopRun]);

    const isFinished = ghostTotalDistanceM > 0 && distanceM >= ghostTotalDistanceM;

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
            {isReady && (
                <View
                    pointerEvents="auto"
                    style={[s.countdownOverlay, { backgroundColor: colors.background }]}
                >
                    <Text style={[s.countdownText, { color: colors.primary }]}>
                        {countdown > 0 ? countdown : "GO!"}
                    </Text>
                    <Text style={[s.countdownLabel, { color: colors.text }]}>준비하세요!</Text>
                </View>
            )}

            <View style={[s.header, { backgroundColor: colors.headerBg, borderColor: colors.border }]}>
                <View style={[s.headerPill, { backgroundColor: colors.headerBg, borderColor: colors.border }]}>
                    <View style={s.statusDot} />
                    <Text style={[s.headerPillText, { color: colors.text }]}>고스트 모드</Text>
                </View>

                <TouchableOpacity
                    hitSlop={10}
                    activeOpacity={0.85}
                    style={[s.headerIconBtn, { backgroundColor: colors.headerBg, borderColor: colors.border }]}
                    onPress={() => setIsSoundOn((v) => !v)}
                >
                    <Ionicons
                        name={(isSoundOn ? "volume-high-outline" : "volume-mute-outline") as IoniconName}
                        size={22}
                        color={colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 120,
                    backgroundColor: colors.background,
                }}
            >
                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={s.cardTopRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name={"medal-outline" as IoniconName} size={18} color={colors.text} />
                            <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>실시간 경쟁</Text>
                        </View>

                        <View style={[s.badge, { backgroundColor: colors.primary }]}>
                            <Text style={[s.badgeText, { color: "#fff" }]}>
                                {isFinished ? "완주!" : formatDiffBadge(ghostDistanceM - distanceM)}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 14 }}>
                        <View style={s.rankRow}>
                            <Text style={[s.rankLabel, { color: colors.mutedText }]}>👻 고스트</Text>
                            <Text style={[s.rankValue, { color: colors.mutedText }]}>{ghostKmText} km</Text>
                        </View>

                        <View style={[s.gaugeTrack, { backgroundColor: "rgba(0,0,0,0.06)" }]}>
                            <View
                                style={[
                                    s.gaugeFill,
                                    {
                                        width: `${ghostRatio * 100}%`,
                                        backgroundColor: colors.primary,
                                        opacity: 0.55,
                                    },
                                ]}
                            />
                        </View>

                        <View style={[s.rankRow, { marginTop: 14 }]}>
                            <Text style={[s.rankLabel, { color: colors.mutedText }]}>👣 YOU</Text>
                            <Text style={[s.rankValue, { color: colors.mutedText }]}>{youKmText} km</Text>
                        </View>

                        <View style={[s.gaugeTrack, { backgroundColor: "rgba(0,0,0,0.06)" }]}>
                            <View
                                style={[
                                    s.gaugeFill,
                                    {
                                        width: `${youRatio * 100}%`,
                                        backgroundColor: colors.primary,
                                        opacity: 1,
                                    },
                                ]}
                            />
                        </View>

                        <View style={s.progressMarks}>
                            <Text style={[s.mark, { color: colors.mutedText }]}>0km</Text>
                            <Text style={[s.mark, { color: colors.mutedText }]}>{markMid}</Text>
                            <Text style={[s.mark, { color: colors.mutedText }]}>{markRight}</Text>
                        </View>
                    </View>
                </View>

                <View style={s.metricsRow}>
                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>시간</Text>
                        <Text style={[s.metricValue, { color: colors.text2 }]}>{formatTime(time)}</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border, marginLeft: 10 }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>거리</Text>
                        <Text style={[s.metricValue, { color: colors.text2 }]}>{youKmText}</Text>
                        <Text style={[s.metricUnit, { color: colors.mutedText }]}>km</Text>
                    </View>

                    <View style={[s.metric, { backgroundColor: colors.card, borderColor: colors.border, marginLeft: 10 }]}>
                        <Text style={[s.metricLabel, { color: colors.mutedText }]}>페이스</Text>
                        <Text style={[s.metricValue, { color: colors.text2 }]}>{formatPace(currentPaceSec)}</Text>
                        <Text style={[s.metricUnit, { color: colors.mutedText }]}>/km</Text>
                    </View>
                </View>

                <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={"analytics-outline" as IoniconName} size={18} color={colors.text} />
                        <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>페이스 변화</Text>
                    </View>

                    <LineChart
                        key={chartKey}
                        data={chartData}
                        width={Math.min(W - 32 - 28, 420)}
                        height={160}
                        chartConfig={chartConfig}
                        bezier
                        style={{ marginTop: 12, borderRadius: 14 }}
                        withInnerLines={true}
                        withOuterLines={false}
                        withVerticalLabels={false}
                        withHorizontalLabels={false}
                        withDots={false}
                        withShadow={true}
                        fromZero={false}
                        segments={4}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                        <Text style={[s.small, { color: colors.mutedText }]}>시작</Text>
                        <Text style={[s.small, { color: colors.mutedText }]}>
                            현재 페이스: {formatPace(currentPaceSec)}/km
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[s.controls, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={[s.controlBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={isPaused ? resumeRun : pauseRun}
                    activeOpacity={0.85}
                    disabled={isFinished}
                >
                    <Ionicons name={(isPaused ? "play" : "pause") as IoniconName} size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[s.stopBtn, { backgroundColor: colors.danger, marginLeft: 14, opacity: isFinished ? 0.6 : 1 }]}
                    onPress={stopRun}
                    activeOpacity={0.85}
                    disabled={isFinished}
                >
                    <Ionicons name={"stop" as IoniconName} size={22} color={"white"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const shadow = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
    default: {},
});

const shadow2 = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 3 },
    default: {},
});

const s = StyleSheet.create({
    safe: { flex: 1 },

    header: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderBottomWidth: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 13,
        borderWidth: 1,
        ...shadow,
    },
    headerPillText: { fontWeight: "800", fontSize: 13, marginLeft: 6, marginRight: 6 },

    headerIconBtn: {
        width: 44,
        height: 40,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        ...shadow,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "gray",
        marginRight: 8,
    },

    card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, ...shadow2 },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontWeight: "900", fontSize: 14 },

    badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontWeight: "900", fontSize: 12 },

    rankRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    rankLabel: { fontSize: 12, fontWeight: "700" },
    rankValue: { fontSize: 12, fontWeight: "700" },

    gaugeTrack: {
        height: 10,
        borderRadius: 999,
        overflow: "hidden",
        marginTop: 10,
    },
    gaugeFill: { height: "100%", borderRadius: 999 },

    progressMarks: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    mark: { fontSize: 11, fontWeight: "700" },

    metricsRow: { flexDirection: "row", marginBottom: 12 },

    metric: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        ...shadow2,
    },

    metricLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
    metricValue: { fontSize: 20, fontWeight: "900", marginTop: 6, textAlign: "center" },
    metricUnit: { fontSize: 12, marginTop: 2, fontWeight: "600", textAlign: "center" },

    small: { fontSize: 11, fontWeight: "700" },

    controls: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 14,
        paddingBottom: 24,
        borderTopWidth: 2,
    },
    controlBtn: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        ...shadow2,
    },
    stopBtn: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        ...shadow2,
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        elevation: 999,
    },
    countdownText: { fontSize: 120, fontWeight: "900" },
    countdownLabel: { fontSize: 20, marginTop: 12 },
});
