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
import * as Speech from "expo-speech";

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
        isRunning,
        isPaused,
        time,
        distanceM,
        currentPaceSec,
        ghostDistanceM,
        ghostTotalDistanceM,
        ghostAvgPaceSec, // ✅ 시작 안내에 목표 페이스로 사용
        paceHistoryMin,
        diffM, // ✅ 100m 단위 안내에 사용
        paceDiffSec, // ✅ 페이스 유사(±5초) 판단에 사용
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

    const [rtPaceData, setRtPaceData] = useState<number[]>([0, 0]);
    const lastAddedRef = useRef<number | null>(null);
    const startedRef = useRef(false);

    // ============================================================
    // ✅ [음성] 공통 speak 유틸 + "말하는 중" 원천 차단
    // ============================================================
    const speakingRef = useRef(false);

    const speak = (text: string, onDone?: () => void) => {
        if (!isSoundOn) return;

        speakingRef.current = true;
        Speech.stop();

        Speech.speak(text, {
            language: "ko-KR",
            rate: 1.0,
            pitch: 1.0,
            onDone: () => {
                speakingRef.current = false;
                onDone?.();
            },
            onStopped: () => {
                speakingRef.current = false;
            },
            onError: () => {
                speakingRef.current = false;
            },
        });
    };

    // ✅ 사운드 끌 때 즉시 정지
    useEffect(() => {
        if (!isSoundOn) {
            speakingRef.current = false;
            Speech.stop();
        }
    }, [isSoundOn]);

    // ✅ 화면 나갈 때 음성 정지
    useEffect(() => {
        return () => {
            speakingRef.current = false;
            Speech.stop();
        };
    }, []);

    // ============================================================
    // ✅ 시작/종료 음성 안내 (일반 측정처럼)
    // - 시작: 총 거리 + 목표 페이스(=고스트 평균 페이스)
    // - 종료: 총 거리 + 평균 페이스(내 평균)
    // ============================================================
    const startSpokenRef = useRef(false);
    const compareBlockUntilRef = useRef<number>(0); // ✅ 시작 안내 직후 비교 음성 차단용(원천 차단 포함)

    const buildStartMessage = () => {
        const km = ghostTotalDistanceM > 0 ? (ghostTotalDistanceM / 1000).toFixed(2) : "0";
        const targetPace = formatPace(ghostAvgPaceSec || 0);
        return `고스트 런닝을 시작합니다. 목표 거리는 ${km}킬로미터, 목표 페이스는 ${targetPace}입니다.`;
    };

    const buildEndMessage = () => {
        const km = distanceM > 0 ? (distanceM / 1000).toFixed(2) : "0";
        const avgPaceSec = distanceM > 0 ? time / (distanceM / 1000) : 0;
        const avgPaceText = formatPace(avgPaceSec);
        return `런닝을 종료합니다. 총 거리 ${km}킬로미터, 평균 페이스 ${avgPaceText}입니다.`;
    };

    // ✅ 시작 순간(isReady: true -> false) 한 번만 안내
    // ✅ [핵심] 시작 안내가 "말하는 동안" 비교 음성은 무조건 차단 + 끝난 뒤 15초 차단
    const prevIsReady = useRef(isReady);
    useEffect(() => {
        if (!isSoundOn) {
            prevIsReady.current = isReady;
            return;
        }

        if (prevIsReady.current === true && isReady === false && !startSpokenRef.current) {
            startSpokenRef.current = true;

            // ✅ 시작 안내 말하는 동안 비교 음성 완전 차단
            compareBlockUntilRef.current = Number.MAX_SAFE_INTEGER;

            // ✅ 시작 안내가 끝난 뒤부터 15초 차단
            speak(buildStartMessage(), () => {
                compareBlockUntilRef.current = Date.now() + 15000;
            });
        }

        // 다음 러닝을 위해 초기화(시간이 0으로 돌아가면)
        if (time <= 0) {
            startSpokenRef.current = false;
            compareBlockUntilRef.current = 0;
            speakingRef.current = false;
        }

        prevIsReady.current = isReady;
    }, [isReady, isSoundOn, time, ghostTotalDistanceM, ghostAvgPaceSec]);

    // ✅ 종료 버튼 눌렀을 때: 종료 안내 후 stopRun (동작은 stopRun 그대로)
    const handleStopPress = () => {
        if (isSoundOn) speak(buildEndMessage());
        stopRun();
    };

    // ============================================================
    // ✅ 100m 단위 + 페이스 유사(±5초) 음성 안내
    // ============================================================
    const lastSpokenAtRef = useRef<number>(0);
    const lastBucketRef = useRef<number | null>(null);
    const lastSignRef = useRef<number>(0);
    const lastPaceSimilarRef = useRef<boolean>(false);

    const COOLDOWN_MS = 6000;
    const UNIT_M = 100;
    const PACE_SIMILAR_THRESHOLD_SEC = 5;

    // ✅ 러닝 새로 시작 감지 시(시간이 0 이하로 돌아감) 음성 상태 초기화
    useEffect(() => {
        if (time <= 0) {
            lastSpokenAtRef.current = 0;
            lastBucketRef.current = null;
            lastSignRef.current = 0;
            lastPaceSimilarRef.current = false;
        }
    }, [time]);

    // ✅ 거리 기준 음성 안내
    useEffect(() => {
        if (!isSoundOn) return;
        if (isReady) return;
        if (!isRunning) return;
        if (isPaused) return;

        const now = Date.now();

        // ✅ [원천 차단 1] 누가 말하는 중이면 비교 음성 절대 금지
        if (speakingRef.current) return;

        // ✅ [원천 차단 2] 시작 안내 이후 차단 시간 동안 비교 음성 절대 금지
        if (now < compareBlockUntilRef.current) return;

        const d = Number(diffM); // (+) 뒤처짐, (-) 앞섬
        if (!Number.isFinite(d)) return;

        const absM = Math.abs(d);
        const bucket = Math.floor(absM / UNIT_M);
        const sign = absM < 1 ? 0 : d > 0 ? 1 : -1;

        const paceDiff = Number(paceDiffSec);
        const isPaceSimilar =
            Number.isFinite(paceDiff) && Math.abs(paceDiff) <= PACE_SIMILAR_THRESHOLD_SEC;

        const bucketChanged = lastBucketRef.current === null || bucket !== lastBucketRef.current;
        const signChanged = sign !== lastSignRef.current;
        const paceSimilarChanged = isPaceSimilar !== lastPaceSimilarRef.current;

        const cooldownPassed = now - lastSpokenAtRef.current >= COOLDOWN_MS;

        // ✅ signChanged면 쿨다운 무시
        if (!signChanged && !cooldownPassed) return;

        // 변화가 없으면 발화 X
        if (!bucketChanged && !signChanged && !paceSimilarChanged) return;

        let msg = "";

        if (bucket === 0) {
            if (isPaceSimilar) {
                msg = "고스트와 거의 나란히 달리고 있어요. 페이스도 비슷해요. 지금처럼 유지해요.";
            } else {
                msg = "고스트와 거의 나란히 달리고 있어요.";
            }
        } else {
            const m = bucket * UNIT_M;
            if (sign > 0) msg = `고스트보다 ${m}미터 뒤처지고 있어요.`;
            else msg = `좋아요. 고스트보다 ${m}미터 앞서고 있어요.`;

            if (isPaceSimilar) msg += " 페이스는 거의 비슷해요.";
        }

        if (!msg) return;

        speak(msg);

        lastSpokenAtRef.current = now;
        lastBucketRef.current = bucket;
        lastSignRef.current = sign;
        lastPaceSimilarRef.current = isPaceSimilar;
    }, [isSoundOn, isReady, isRunning, isPaused, diffM, paceDiffSec]);

    // ============================================================
    // ✅ 러닝 "새로 시작" 감지: time이 0 근처로 내려가면 초기화 (기존 유지)
    // ============================================================
    useEffect(() => {
        if (time <= 0) {
            startedRef.current = false;
            lastAddedRef.current = null;
            setRtPaceData([0, 0]);
        }
    }, [time]);

    // ✅ 실시간 누적 append (기존 유지)
    useEffect(() => {
        if (isReady) return;

        if (!startedRef.current && time > 0) {
            startedRef.current = true;
        }

        if (isPaused) return;

        const pace = typeof currentPaceSec === "number" ? currentPaceSec : Number(currentPaceSec);
        if (!Number.isFinite(pace) || pace <= 0) return;

        if (lastAddedRef.current !== null && lastAddedRef.current === pace) return;

        lastAddedRef.current = pace;

        setRtPaceData((prev) => {
            if (prev.length <= 2 && prev[0] === 0 && prev[1] === 0) {
                return [pace, pace];
            }
            return [...prev, pace];
        });
    }, [isReady, isPaused, time, currentPaceSec]);

    const lastLenRef = useRef<number>(0);
    useEffect(() => {
        if (!Array.isArray(paceHistoryMin)) return;

        const len = paceHistoryMin.length;
        if (len <= 0) return;

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

    // ✅ chart-kit 캐시 깨기 (기존 유지)
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
     * ✅ 자동 정지 직전에 종료 음성 안내만 추가
     */
    const stoppedRef = useRef(false);

    useEffect(() => {
        if (stoppedRef.current) return;
        if (!ghostTotalDistanceM || ghostTotalDistanceM <= 0) return;

        if (!isPaused && distanceM >= ghostTotalDistanceM) {
            stoppedRef.current = true;

            if (isSoundOn) speak(buildEndMessage());

            stopRun();
        }
    }, [distanceM, ghostTotalDistanceM, isPaused, stopRun, isSoundOn]);

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
                    style={[
                        s.stopBtn,
                        { backgroundColor: colors.danger, marginLeft: 14, opacity: isFinished ? 0.6 : 1 },
                    ]}
                    onPress={() => {
                        speak("종료하려면 3초 이상 길게 누르세요.");
                    }}
                    onLongPress={handleStopPress}
                    delayLongPress={3000}
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
