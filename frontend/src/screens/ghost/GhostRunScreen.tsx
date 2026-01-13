// frontend/src/screens/ghost/GhostRunScreen.tsx

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    useColorScheme,
    Alert, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import * as Speech from "expo-speech";

import { Colors } from "@/constants/theme";
import { useGhostRunScreen } from "./useGhostRunScreen";
import { StatBox } from "@/components/StatBox";
import { useCadence } from "@/hooks/useCadence";
import { useRunningVoiceFeedback } from "@/hooks/useRunningVoiceFeedback";

const { width: W } = Dimensions.get("window");

type IoniconName =
    | "volume-high"
    | "volume-mute"
    | "pause"
    | "play"
    | "stop"
    | "analytics-outline"
    | "medal-outline";

export default function GhostRunScreen() {
    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

    const c = Colors[colorScheme] as any;
    const colors = {
        background: c?.background ?? "#F5F6F8",
        headerBg: c?.background ?? c?.card ?? "#FFFFFF",
        card: c?.card ?? c?.background ?? "#FFFFFF",
        text: c?.text ?? "#111111",
        text2: c?.text2 ?? c?.text ?? "#222222",
        primary: c?.primary ?? "#4A6EA9",
        border: c?.border ?? "#E5E7EB",
        mutedText: c?.mutedText ?? c?.icon ?? c?.subtext ?? "#6B7280",
        danger: c?.danger ?? "#ff3b30",
        primaryButtonText: c?.primaryButtonText ?? "#ffffff",
    };

    // ✅ RunningScreen과 동일한 방식(화면 단 토글)
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [isMale, setIsMale] = useState(true);

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
        ghostAvgPaceSec,
        paceHistoryMin,
        diffM,
        paceDiffSec,
    } = state;

    const { pauseRun, resumeRun, stopRun } = actions;
    const { formatTime, formatPace, formatDiffBadge } = utils;

    // ✅ 케이던스
    const cadence = useCadence({
        enabled: !isReady && !isPaused,
        windowSec: 5,
    });

    useEffect(() => {
        actions.pushCadenceSample(cadence);
    }, [cadence]);

    // ✅ 음성 훅
    const {
        checkAndSpeak,
        speakStart,
        speakPause,
        speakResume,
        speakStop,
        checkAndSpeakGhostDiff,
    } = useRunningVoiceFeedback({
        isMale,
        targetDistance: ghostTotalDistanceM || 0,
        recommendedPaceSec: ghostAvgPaceSec || undefined,
    });

    // ✅ RunningScreen과 동일: 음성 토글 시 발화 즉시 정지
    const toggleVoice = () => {
        if (isVoiceEnabled) Speech.stop();
        setIsVoiceEnabled(!isVoiceEnabled);
    };

    // ✅ 언마운트 시 발화 정리
    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    // ============================================================
    // ✅ 시작 음성: "무조건 1번만" 나오게 락
    // - 핵심: startSpokenRef
    // - time이 0 이하로 리셋되면 다음 러닝을 위해 락 해제
    // ============================================================
    const prevIsReady = useRef(isReady);
    const startSpokenRef = useRef(false);

    useEffect(() => {
        // 러닝 리셋(새 세션) 시 다시 허용
        if (time <= 0) startSpokenRef.current = false;

        if (
            isVoiceEnabled &&
            prevIsReady.current === true &&
            isReady === false &&
            !startSpokenRef.current
        ) {
            startSpokenRef.current = true;
            speakStart();
        }

        prevIsReady.current = isReady;
    }, [isReady, isVoiceEnabled, time]); // ✅ 의존성 최소화 (중복 트리거 방지)

    // ============================================================
    // ✅ km 체크 음성: RunningScreen과 동일 조건
    // ============================================================
    useEffect(() => {
        if (isVoiceEnabled && !isPaused && !isReady && distanceM > 0) {
            checkAndSpeak(distanceM);
        }
    }, [distanceM, isPaused, isReady, isVoiceEnabled, isMale]);

    // ============================================================
    // ✅ 일시정지/재개 음성: RunningScreen과 동일 트리거
    // ============================================================
    const prevIsPaused = useRef(isPaused);
    useEffect(() => {
        if (isVoiceEnabled && !isReady && prevIsPaused.current !== isPaused) {
            if (isPaused) speakPause();
            else speakResume();
        }
        prevIsPaused.current = isPaused;
    }, [isPaused, isReady, isVoiceEnabled]);

    // ============================================================
    // ✅ 고스트 비교 음성(추가): 100m 이상에서만
    // ============================================================
    useEffect(() => {
        if (!isVoiceEnabled) return;
        if (isReady) return;
        if (!isRunning) return;
        if (isPaused) return;

        if (distanceM < 100) return;

        checkAndSpeakGhostDiff(diffM, paceDiffSec, {
            isReady,
            isRunning,
            isPaused,
            timeSec: time,
        });
    }, [
        isVoiceEnabled,
        isReady,
        isRunning,
        isPaused,
        distanceM,
        diffM,
        paceDiffSec,
        time,
    ]);

    // ============================================================
    // ✅ 차트 데이터
    // ============================================================
    const [rtPaceData, setRtPaceData] = useState<number[]>([0, 0]);
    const lastAddedRef = useRef<number | null>(null);

    useEffect(() => {
        if (time <= 0) {
            lastAddedRef.current = null;
            setRtPaceData([0, 0]);
        }
    }, [time]);

    useEffect(() => {
        if (isReady) return;
        if (isPaused) return;

        const pace =
            typeof currentPaceSec === "number" ? currentPaceSec : Number(currentPaceSec);

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
            colorScheme === "dark"
                ? `rgba(255,255,255,${opacity})`
                : `rgba(0,0,0,${opacity})`,
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

    // ============================================================
    // ✅ 고스트 경쟁 UI 계산
    // ============================================================
    const totalKm = ghostTotalDistanceM > 0 ? ghostTotalDistanceM / 1000 : 0;

    const youRatio =
        ghostTotalDistanceM > 0
            ? Math.max(0, Math.min(1, distanceM / ghostTotalDistanceM))
            : 0;
    const ghostRatio =
        ghostTotalDistanceM > 0
            ? Math.max(0, Math.min(1, ghostDistanceM / ghostTotalDistanceM))
            : 0;

    const youKmText = (distanceM / 1000).toFixed(2);
    const ghostKmText = (ghostDistanceM / 1000).toFixed(2);

    const midKm = totalKm > 0 ? totalKm / 2 : 0;
    const markRight = totalKm > 0 ? `${totalKm.toFixed(1)}km` : "-";
    const markMid = totalKm > 0 ? `${midKm.toFixed(1)}km` : "-";

    // ============================================================
    // ✅ 기록 종료: RunningScreen과 동일 패턴
    // ============================================================
    const handleStopLongPress = () => {
        if (isVoiceEnabled) {
            speakStop(distanceM);
            stopRun();
        } else {
            stopRun();
        }
    };

    const stoppedRef = useRef(false);
    useEffect(() => {
        if (stoppedRef.current) return;
        if (!ghostTotalDistanceM || ghostTotalDistanceM <= 0) return;

        if (!isPaused && !isReady && distanceM >= ghostTotalDistanceM) {
            stoppedRef.current = true;
            if (isVoiceEnabled) speakStop(distanceM);
            stopRun();
        }
    }, [distanceM, ghostTotalDistanceM, isPaused, isReady, isVoiceEnabled, stopRun]);

    const isFinished = ghostTotalDistanceM > 0 && distanceM >= ghostTotalDistanceM;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            {isReady && (
                <View
                    pointerEvents="auto"
                    style={[styles.countdownOverlay, { backgroundColor: colors.background }]}
                >
                    <Text style={[styles.countdownText, { color: colors.primary }]}>
                        {countdown > 0 ? countdown : "GO!"}
                    </Text>
                    <Text style={[styles.countdownLabel, { color: colors.text }]}>
                        준비하세요!
                    </Text>
                </View>
            )}

            <View
                style={[
                    styles.header,
                    { backgroundColor: colors.headerBg, borderColor: colors.border },
                ]}
            >
                <View
                    style={[
                        styles.headerPill,
                        { backgroundColor: colors.headerBg, borderColor: colors.border },
                    ]}
                >
                    <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.headerPillText, { color: colors.text }]}>고스트 모드</Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => setIsMale((v) => !v)}
                        style={[
                            styles.headerMiniPill,
                            { backgroundColor: colors.headerBg, borderColor: colors.primary },
                        ]}
                        activeOpacity={0.85}
                    >
                        <Text style={{ fontSize: 12, fontWeight: "800", color: colors.primary }}>
                            {isMale ? "남성" : "여성"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleVoice}
                        style={[
                            styles.headerMiniPill,
                            {
                                backgroundColor: isVoiceEnabled ? colors.primary : colors.headerBg,
                                borderColor: isVoiceEnabled ? colors.primary : colors.border,
                            },
                        ]}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name={(isVoiceEnabled ? "volume-high" : "volume-mute") as IoniconName}
                            size={14}
                            color={isVoiceEnabled ? "#FFF" : colors.mutedText}
                        />
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "800",
                                marginLeft: 5,
                                color: isVoiceEnabled ? "#FFF" : colors.mutedText,
                            }}
                        >
                            {isVoiceEnabled ? "음성 ON" : "음성 OFF"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 120,
                    backgroundColor: colors.background,
                }}
            >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardTopRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Ionicons name={"medal-outline" as IoniconName} size={18} color={colors.text} />
                            <Text style={[styles.cardTitle, { color: colors.text, marginLeft: 8 }]}>
                                실시간 경쟁
                            </Text>
                        </View>

                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.badgeText, { color: colors.primaryButtonText }]}>
                                {isFinished ? "완주!" : formatDiffBadge(ghostDistanceM - distanceM)}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 14 }}>
                        <View style={styles.rankRow}>
                            <Text style={[styles.rankLabel, { color: colors.mutedText }]}>👻 고스트</Text>
                            <Text style={[styles.rankValue, { color: colors.mutedText }]}>{ghostKmText} km</Text>
                        </View>

                        <View style={[styles.gaugeTrack, { backgroundColor: "rgba(0,0,0,0.06)" }]}>
                            <View
                                style={[
                                    styles.gaugeFill,
                                    { width: `${ghostRatio * 100}%`, backgroundColor: colors.primary, opacity: 0.55 },
                                ]}
                            />
                        </View>

                        <View style={[styles.rankRow, { marginTop: 14 }]}>
                            <Text style={[styles.rankLabel, { color: colors.mutedText }]}>👣 YOU</Text>
                            <Text style={[styles.rankValue, { color: colors.mutedText }]}>{youKmText} km</Text>
                        </View>

                        <View style={[styles.gaugeTrack, { backgroundColor: "rgba(0,0,0,0.06)" }]}>
                            <View
                                style={[
                                    styles.gaugeFill,
                                    { width: `${youRatio * 100}%`, backgroundColor: colors.primary, opacity: 1 },
                                ]}
                            />
                        </View>

                        <View style={styles.progressMarks}>
                            <Text style={[styles.mark, { color: colors.mutedText }]}>0km</Text>
                            <Text style={[styles.mark, { color: colors.mutedText }]}>{markMid}</Text>
                            <Text style={[styles.mark, { color: colors.mutedText }]}>{markRight}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <StatBox
                        icon={<Ionicons name="time-outline" size={24} color={colors.primary} />}
                        label="시간"
                        value={formatTime(time)}
                    />
                    <StatBox
                        icon={<MaterialCommunityIcons name="flag-checkered" size={24} color={colors.primary} />}
                        label="거리"
                        value={(distanceM / 1000).toFixed(2)}
                        unit="km"
                        highlight
                    />
                    <StatBox
                        icon={<MaterialCommunityIcons name="run" size={24} color={colors.primary} />}
                        label="페이스"
                        value={formatPace(currentPaceSec)}
                        unit="/km"
                    />
                    <StatBox
                        icon={<MaterialCommunityIcons name="shoe-print" size={24} color={colors.primary} />}
                        label="케이던스"
                        value={String(cadence)}
                        unit="spm"
                    />
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name={"analytics-outline" as IoniconName} size={18} color={colors.text} />
                        <Text style={[styles.cardTitle, { color: colors.text, marginLeft: 8 }]}>페이스 변화</Text>
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
                        <Text style={[styles.small, { color: colors.mutedText }]}>시작</Text>
                        <Text style={[styles.small, { color: colors.mutedText }]}>
                            현재 페이스: {formatPace(currentPaceSec)}/km
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.controls, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.pauseBtn}
                    onPress={() => {
                        if (isFinished) return;
                        if (isPaused) resumeRun();
                        else pauseRun();
                    }}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name={(isPaused ? "play" : "pause") as IoniconName}
                        size={36}
                        color={colors.primary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.stopBtn,
                        { backgroundColor: colors.danger, opacity: isFinished ? 0.6 : 1 },
                    ]}
                    onPress={() => Alert.alert("알림", "종료하려면 길게 누르세요.")}
                    onLongPress={handleStopLongPress}
                    delayLongPress={1000}
                    activeOpacity={0.85}
                    disabled={isFinished}
                >
                    <View style={styles.stopSquare} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export const getStyles = (scheme: "light" | "dark") => {
    const shadow = Platform.select({
        ios: {
            shadowColor: Colors[scheme].shadow,
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 4 },
        default: {},
    });

    const shadow2 = Platform.select({
        ios: {
            shadowColor: Colors[scheme].shadow,
            shadowOpacity: 0.04,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 3 },
        default: {},
    });

    return StyleSheet.create({
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

        headerMiniPill: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 999,
            borderWidth: 1,
            ...shadow,
        },

        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 999,
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

        gaugeTrack: { height: 10, borderRadius: 999, overflow: "hidden", marginTop: 10 },
        gaugeFill: { height: "100%", borderRadius: 999 },

        progressMarks: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
        mark: { fontSize: 11, fontWeight: "700" },

        statsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
        },

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

        pauseBtn: {
            width: 72,
            height: 72,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: Colors[scheme].border ?? "#E5E7EB",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors[scheme].card ?? "#FFF",
            ...shadow2,
        },

        stopBtn: {
            width: 72,
            height: 72,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 14,
            ...shadow2,
        },

        stopSquare: {
            width: 24,
            height: 24,
            backgroundColor: "#FFF",
            borderRadius: 4,
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
};
