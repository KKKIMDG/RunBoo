// frontend/src/screens/ghost/GhostRunScreen.tsx

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import * as Speech from "expo-speech";

import { Colors } from "@/constants/theme";
import { useGhostRunScreen } from "./useGhostRunScreen";
import { StatBox } from "@/components/StatBox";
import { useCadence } from "@/hooks/useCadence";
import { useRunningVoiceFeedback } from "@/hooks/useRunningVoiceFeedback";
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";
import { useMapFocusing } from "@/screens/running/useRunCore";
import { darkMapStyle, lightMapStyle } from "@/screens/Home/mapStyles";
import { getStyles } from "./GhostRunScreen.styles";

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
  const mapRef = useRef<MapView>(null);
  const { settings } = useSettings();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);

  const styles = useMemo(() => {
    return getStyles(resolvedTheme, settings?.fontSize || "MEDIUM");
  }, [resolvedTheme, settings?.fontSize]);

  const isDarkMode = resolvedTheme === "dark";

  const c = Colors[resolvedTheme] as any;
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

  // ============================================================
  // ✅ 핵심 변경점(요구사항 반영)
  // - 기본(초기값)은 "설정"의 남/여 + 음성 ON/OFF를 따른다.
  // - 고스트 화면에서 남/여 토글은 "이번 세션 한정 임시 변경"이다.
  // - 다음에 고스트에 다시 들어오면(언마운트/재마운트) 다시 설정값으로 돌아온다.
  // - 설정값은 절대 업데이트하지 않는다.
  // ============================================================

  // ✅ (1) 초기값: 설정 기반
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(
    settings?.voiceGuideEnabled ?? true,
  );
  const [isMale, setIsMale] = useState(
    (settings?.voiceType ?? "MALE") === "MALE",
  );

  // ✅ (2) 고스트 화면에서 남/여를 임시로 바꿨는지 여부 (세션 한정)
  const tempOverrideMaleRef = useRef(false);

  // ✅ (3) 설정이 로딩되거나 바뀌면 기본값 동기화
  // - 단, 남/여는 고스트에서 임시 토글을 한 번이라도 했으면 그 세션에서는 설정 동기화하지 않음
  useEffect(() => {
    if (!settings) return;

    // 음성 ON/OFF는 기본적으로 설정 따라가게 (원하면 이것도 임시 토글로 확장 가능)
    setIsVoiceEnabled(settings.voiceGuideEnabled);

    // 남/여는 "임시 변경"이 없을 때만 설정 따라가게
    if (!tempOverrideMaleRef.current) {
      setIsMale(settings.voiceType === "MALE");
    }
  }, [settings?.voiceGuideEnabled, settings?.voiceType]);

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
    routeCoordinates,
  } = state;

  // 초기 위치는 routeCoordinates의 첫 좌표 사용
  const initialLocation =
    routeCoordinates.length > 0 ? routeCoordinates[0] : null;

  const mapFocusing = useMapFocusing({
    mapRef,
    initialLocation,
    routeCoordinates,
  });

  const { isFollowing, onLocationUpdate, handleFocusPress } = mapFocusing;

  // ✅ 위치 업데이트 시 지도 자동 추적
  useEffect(() => {
    if (routeCoordinates.length > 0 && onLocationUpdate.current) {
      const lastCoord = routeCoordinates[routeCoordinates.length - 1];
      onLocationUpdate.current(lastCoord);
    }
  }, [routeCoordinates]);

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
  // ============================================================
  const prevIsReady = useRef(isReady);
  const startSpokenRef = useRef(false);

  useEffect(() => {
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
  }, [isReady, isVoiceEnabled, time]);

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
      typeof currentPaceSec === "number"
        ? currentPaceSec
        : Number(currentPaceSec);

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
        lastAddedRef.current =
          cleaned[cleaned.length - 1] ?? lastAddedRef.current;
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
      resolvedTheme === "dark"
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
    [rtPaceData],
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
  }, [
    distanceM,
    ghostTotalDistanceM,
    isPaused,
    isReady,
    isVoiceEnabled,
    stopRun,
  ]);

  const isFinished =
    ghostTotalDistanceM > 0 && distanceM >= ghostTotalDistanceM;

  const renderedMap = useMemo(
    () => (
      <View style={StyleSheet.absoluteFill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          showsUserLocation={true}
          loadingEnabled={true}
          customMapStyle={
            resolvedTheme === "dark" ? darkMapStyle : lightMapStyle
          }
          showsMyLocationButton={false}
          onPanDrag={() => {
            if (isFollowing) {
              mapFocusing.setIsFollowing(false);
            }
          }}
          initialRegion={
            initialLocation
              ? {
                  ...initialLocation,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }
              : {
                  latitude: 37.5665,
                  longitude: 126.978,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }
          }
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.15)"
                : "rgba(255,255,255,0.1)",
            },
          ]}
          pointerEvents="none"
        />
      </View>
    ),
    [initialLocation, isDarkMode, isFollowing],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {isReady && (
        <View
          pointerEvents="auto"
          style={[
            styles.countdownOverlay,
            { backgroundColor: colors.background },
          ]}
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
          <View
            style={[styles.statusDot, { backgroundColor: colors.primary }]}
          />
          <Text style={[styles.headerPillText, { color: colors.text }]}>
            고스트 모드
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              // ✅ 이번 고스트 세션에서만 임시 변경
              tempOverrideMaleRef.current = true;
              setIsMale((v) => !v);
            }}
            style={[
              styles.headerMiniPill,
              { backgroundColor: colors.headerBg, borderColor: colors.primary },
            ]}
            activeOpacity={0.85}
          >
            <Text
              style={{ fontSize: 12, fontWeight: "800", color: colors.primary }}
            >
              {isMale ? "남성" : "여성"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleVoice}
            style={[
              styles.headerMiniPill,
              {
                backgroundColor: isVoiceEnabled
                  ? colors.primary
                  : colors.headerBg,
                borderColor: isVoiceEnabled ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.85}
          >
            <Ionicons
              name={
                (isVoiceEnabled ? "volume-high" : "volume-mute") as IoniconName
              }
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

      <View style={styles.mapContainer}>
        {!initialLocation ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDarkMode ? "#1e1e1e" : "#f0f0f0",
              },
            ]}
          >
            <ActivityIndicator size="large" color="#4A6EA9" />
          </View>
        ) : (
          renderedMap
        )}

        <TouchableOpacity
          style={[
            styles.locationButton,
            {
              backgroundColor: isFollowing
                ? "#4A6EA9"
                : isDarkMode
                  ? "#333"
                  : "#FFF",
            },
          ]}
          onPress={handleFocusPress}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color={isFollowing ? "#FFF" : isDarkMode ? "#AAA" : "#333"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardTopRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={"medal-outline" as IoniconName}
                size={18}
                color={colors.text}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text, marginLeft: 8 },
                ]}
              >
                실시간 경쟁
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text
                style={[styles.badgeText, { color: colors.primaryButtonText }]}
              >
                {isFinished
                  ? "완주!"
                  : formatDiffBadge(ghostDistanceM - distanceM)}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <View style={styles.rankRow}>
              <Text style={[styles.rankLabel, { color: colors.mutedText }]}>
                👻 GHOST
              </Text>
              <Text style={[styles.rankValue, { color: colors.mutedText }]}>
                {ghostKmText} km
              </Text>
            </View>

            <View
              style={[
                styles.gaugeTrack,
                { backgroundColor: "rgba(0,0,0,0.06)" },
              ]}
            >
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${ghostRatio * 100}%`,
                    backgroundColor: colors.primary,
                    opacity: 0.55,
                  },
                ]}
              />
            </View>

            <View style={[styles.rankRow, { marginTop: 14 }]}>
              <Text style={[styles.rankLabel, { color: colors.mutedText }]}>
                👣 YOU
              </Text>
              <Text style={[styles.rankValue, { color: colors.mutedText }]}>
                {youKmText} km
              </Text>
            </View>

            <View
              style={[
                styles.gaugeTrack,
                { backgroundColor: "rgba(0,0,0,0.06)" },
              ]}
            >
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${youRatio * 100}%`,
                    backgroundColor: colors.primary,
                    opacity: 1,
                  },
                ]}
              />
            </View>

            <View style={styles.progressMarks}>
              <Text style={[styles.mark, { color: colors.mutedText }]}>
                0km
              </Text>
              <Text style={[styles.mark, { color: colors.mutedText }]}>
                {markMid}
              </Text>
              <Text style={[styles.mark, { color: colors.mutedText }]}>
                {markRight}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatBox
            icon={
              <Ionicons name="time-outline" size={24} color={colors.primary} />
            }
            label="시간"
            value={formatTime(time)}
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="flag-checkered"
                size={24}
                color={colors.primary}
              />
            }
            label="거리"
            value={(distanceM / 1000).toFixed(2)}
            unit="km"
            highlight
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="run"
                size={24}
                color={colors.primary}
              />
            }
            label="페이스"
            value={formatPace(currentPaceSec)}
            unit="/km"
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="shoe-print"
                size={24}
                color={colors.primary}
              />
            }
            label="케이던스"
            value={String(cadence)}
            unit="spm"
          />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={"analytics-outline" as IoniconName}
              size={18}
              color={colors.text}
            />
            <Text
              style={[styles.cardTitle, { color: colors.text, marginLeft: 8 }]}
            >
              페이스 변화
            </Text>
          </View>

          <LineChart
            key={chartKey}
            data={chartData}
            width={W - 32}
            height={160}
            chartConfig={chartConfig}
            bezier
            style={{ marginTop: 12, borderRadius: 14, marginLeft: -35 }}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLabels={false}
            withHorizontalLabels={false}
            withDots={false}
            withShadow={true}
            fromZero={false}
            segments={4}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={[styles.small, { color: colors.mutedText }]}>
              시작
            </Text>
            <Text style={[styles.small, { color: colors.mutedText }]}>
              현재 페이스: {formatPace(currentPaceSec)}/km
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 하단 컨트롤 버튼 */}
      {!isReady && (
        <View style={[styles.controls, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[
              styles.pauseBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              if (isFinished) return;
              if (isPaused) resumeRun();
              else pauseRun();
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              {isPaused ? "재개" : "일시정지"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stopBtn,
              {
                backgroundColor: colors.danger,
                opacity: isFinished ? 0.6 : 1,
              },
            ]}
            onPress={() => {
              Alert.alert(
                "고스트 러닝 종료",
                "고스트 러닝을 종료하시겠습니까?",
                [
                  {
                    text: "취소",
                    style: "cancel",
                  },
                  {
                    text: "종료",
                    onPress: handleStopLongPress,
                    style: "destructive",
                  },
                ],
              );
            }}
            activeOpacity={0.85}
            disabled={isFinished}
          >
            <Text style={styles.buttonTextWhite}>러닝종료</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
