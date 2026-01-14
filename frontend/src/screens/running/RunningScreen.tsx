import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { LineChart } from "react-native-chart-kit";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import "@/services/record/locationTask";
import { useRunningScreen } from "./useRunningScreen";
import { getStyles } from "./RunningScreen.styles";
import { StatBox } from "@/components/StatBox";
import { useRunningVoiceFeedback } from "@/hooks/useRunningVoiceFeedback";
import { useCadence } from "@/hooks/useCadence";
import { useMapFocusing } from "./useRunCore";

import * as Speech from "expo-speech";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { useSettings } from "@/screens/Settings/useSettings";
import {darkMapStyle, lightMapStyle} from "@/screens/Home/mapStyles";

const { width } = Dimensions.get("window");

const RunningScreen = () => {
  const mapRef = useRef<MapView>(null);
  const { settings } = useSettings();
  const colorScheme = useResolvedTheme(settings?.themeMode);
  const isDarkMode = colorScheme === "dark";

  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  // ✅ 훅에서 모든 상태와 액션을 가져옵니다.
  const { state, actions, utils } = useRunningScreen();

  const {
    isPaused,
    time,
    distance,
    currentPace,
    routeCoordinates,
    paceHistory,
    isReady,
    countdown,
    initialLocation,
    targetDistance,
    isVoiceEnabled,
    isMale,
  } = state;

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

  // ✅ 케이던스 훅 (Screen에서만 측정)
  const cadence = useCadence({
    enabled: !isReady && !isPaused,
    windowSec: 5,
  });

  // ✅ [추가] cadence 샘플을 훅에 전달해서 평균 계산/DB 저장에 사용
  // (cadence는 route param으로 절대 안 넘김)
  useEffect(() => {
    if (cadence > 0) {
      console.log("[RunningScreen] 케이던스 샘플 추가:", cadence);
    }
    actions.pushCadenceSample(cadence);
  }, [cadence]);

  const { pauseRun, resumeRun, stopRun, setIsVoiceEnabled, setIsMale } =
    actions;

  const { formatTime, formatPace } = utils;

  const { checkAndSpeak, speakStart, speakPause, speakResume, speakStop } =
    useRunningVoiceFeedback({
      isMale: isMale,
      targetDistance: targetDistance,
    });

  const toggleVoice = () => {
    console.log("[RunningScreen] 음성 토글:", !isVoiceEnabled);
    if (isVoiceEnabled) Speech.stop();
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const prevIsReady = useRef(isReady);
  useEffect(() => {
    if (isVoiceEnabled && prevIsReady.current === true && isReady === false) {
      console.log("[RunningScreen] 시작 안내 음성 재생");
      speakStart();
    }
    prevIsReady.current = isReady;
  }, [isReady, isVoiceEnabled]);

  useEffect(() => {
    if (isVoiceEnabled && !isPaused && !isReady && distance > 0) {
      console.log("[RunningScreen] 음성 안내 확인 - 거리:", distance);
      checkAndSpeak(distance);
    }
  }, [distance, isPaused, isReady, isVoiceEnabled, isMale]);

  const prevIsPaused = useRef(isPaused);
  useEffect(() => {
    if (isVoiceEnabled && !isReady && prevIsPaused.current !== isPaused) {
      if (isPaused) {
        console.log("[RunningScreen] 일시정지 안내 음성 재생");
        speakPause();
      } else {
        console.log("[RunningScreen] 재개 안내 음성 재생");
        speakResume();
      }
    }
    prevIsPaused.current = isPaused;
  }, [isPaused, isReady, isVoiceEnabled]);

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
            colorScheme === "dark" ? darkMapStyle : lightMapStyle
          }
          showsMyLocationButton={false}
          onPanDrag={() => {
            if (isFollowing) {
              console.log("[RunningScreen] 지도 드래그됨, 자동 추적 비활성화");
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
    [initialLocation, isDarkMode, isFollowing]
  );

  const chartData = useMemo(
    () => ({
      labels: [],
      datasets: [
        {
          data: paceHistory.length > 0 ? paceHistory : [0],
          color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    }),
    [paceHistory]
  );

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
      backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(74,110,169,${opacity})`,
      labelColor: () => (isDarkMode ? "#FFF" : "#333"),
      propsForDots: { r: "0" },
      propsForBackgroundLines: {
        strokeWidth: 0,
      },
    }),
    [isDarkMode]
  );

  // ✅ 변경: stopRun()은 인자 없이 호출 (cadence는 훅에서 평균 계산 후 DB 저장)
  const handleStopLongPress = () => {
    console.log("[RunningScreen] 정지 버튼 길게 누름");
    if (isVoiceEnabled) {
      console.log("[RunningScreen] 정지 안내 음성 재생");
      speakStop(distance);
      stopRun();
    } else {
      stopRun();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isReady && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>
            {countdown > 0 ? countdown : "GO!"}
          </Text>
          <Text style={styles.countdownLabel}>준비하세요!</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.statusTag}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPaused ? "#FFB347" : "#4CAF50" },
              ]}
            />
            <Text style={styles.statusText}>
              {isPaused ? "일시정지" : "러닝 중"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                console.log(
                  "[RunningScreen] 성별 토글 누름:",
                  !isMale ? "남성" : "여성"
                );
                setIsMale(!isMale);
              }}
              style={customStyles.genderToggle}
            >
              <Text style={{ fontSize: 12, color: "#4A6EA9" }}>
                {isMale ? "남성" : "여성"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleVoice}
              style={[
                customStyles.genderToggle,
                { backgroundColor: isVoiceEnabled ? "#4A6EA9" : "#E0E0E0" },
              ]}
            >
              <Ionicons
                name={isVoiceEnabled ? "volume-high" : "volume-mute"}
                size={14}
                color={isVoiceEnabled ? "#FFF" : "#666"}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isVoiceEnabled ? "#FFF" : "#666",
                  marginLeft: 4,
                }}
              >
                {isVoiceEnabled ? "음성 ON" : "음성 OFF"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatBox
            icon={<Ionicons name="time-outline" size={24} color="#4A6EA9" />}
            label="시간"
            value={formatTime(time)}
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="flag-checkered"
                size={24}
                color="#4A6EA9"
              />
            }
            label="거리"
            value={(distance / 1000).toFixed(2)}
            unit="km"
            highlight
          />
          <StatBox
            icon={<FontAwesome5 name="running" size={22} color="#4A6EA9" />}
            label="페이스"
            value={formatPace(currentPace)}
            unit="/km"
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="shoe-print"
                size={24}
                color="#4A6EA9"
              />
            }
            label="케이던스"
            value={String(cadence)}
            unit="spm"
          />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartTitleContainer}>
            <Ionicons
              name="analytics-outline"
              size={20}
              color={isDarkMode ? "#FFF" : "#333"}
            />
            <Text style={styles.chartTitle}>페이스 변화</Text>
          </View>
          <LineChart
            data={chartData}
            width={width - 80}
            height={150}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={false}
            withHorizontalLabels={false}
          />
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabelText}>시작</Text>
            <Text style={styles.chartLabelText}>
              현재: {formatPace(currentPace)}/km
            </Text>
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
              customStyles.focusButton,
              isFollowing && customStyles.focusButtonActive,
            ]}
            onPress={() => {
              console.log("[RunningScreen] 포커스 버튼 누름");
              handleFocusPress();
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isFollowing ? "crosshairs-gps" : "crosshairs"}
              size={24}
              color={isFollowing ? "#FFF" : "#4A6EA9"}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.controlContainer}>
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={() => {
            if (isPaused) {
              console.log("[RunningScreen] 재개 버튼 누름");
              resumeRun();
            } else {
              console.log("[RunningScreen] 일시정지 버튼 누름");
              pauseRun();
            }
          }}
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={36}
            color="#4A6EA9"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.stopButton, { backgroundColor: "#FF3B30" }]}
          onPress={() => Alert.alert("알림", "종료하려면 길게 누르세요.")}
          onLongPress={handleStopLongPress}
          delayLongPress={1000}
        >
          <View style={customStyles.stopSquare} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const customStyles = StyleSheet.create({
  focusButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    zIndex: 10,
  },
  focusButtonActive: { backgroundColor: "#4A6EA9", borderColor: "#4A6EA9" },
  stopSquare: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 4,
  },
  genderToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4A6EA9",
  },
});

export default RunningScreen;
