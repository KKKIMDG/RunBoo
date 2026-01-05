import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
  Alert,
  ToastAndroid,
  Platform,
  StyleSheet,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { LineChart } from "react-native-chart-kit";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTierRunningScreen } from "./useTierRunningScreen";
import { getStyles } from "./RunningScreen.styles";
import { StatBox } from "@/components/StatBox";

const { width } = Dimensions.get("window");

const TierRunningScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const styles = getStyles(isDarkMode);

  const mapRef = useRef<MapView>(null);
  // 수정: 사용자가 지도를 직접 움직였는지 여부를 관리 (자동 추적 활성화 상태)
  const [isTracking, setIsTracking] = useState(true);

  const { state, actions, utils } = useTierRunningScreen();

  const {
    isPaused,
    time,
    remainingDistance,
    currentPace,
    paceHistory,
    isReady,
    countdown,
    lastLocation,
  } = state;

  const { pauseRun, resumeRun, stopTierRunManual } = actions;
  const { formatTime, formatPace } = utils;

  // 1. 카메라 이동 로직: isTracking이 true일 때만 자동으로 내 위치 추적
  useEffect(() => {
    if (lastLocation && !isPaused && isTracking && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        1000
      );
    }
  }, [lastLocation, isPaused, isTracking]);

  // 내 위치로 즉시 이동하고 추적 다시 활성화
  const moveToCurrentLocation = () => {
    if (lastLocation && mapRef.current) {
      setIsTracking(true);
      mapRef.current.animateToRegion(
        {
          ...lastLocation,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        500
      );
    }
  };

  const handleStopPress = () => {
    const msg = "종료하려면 버튼을 길게 눌러주세요.";
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert("알림", msg);
  };

  /** 차트 설정 */
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

  // 2. 지도 메모이제이션 (리로드 방지)
  const renderedMap = useMemo(
    () => (
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={false}
        // 사용자가 지도를 직접 움직이면 자동 추적 일시 중지
        onPanDrag={() => setIsTracking(false)}
        initialRegion={
          lastLocation
            ? {
                ...lastLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }
            : {
                latitude: 37.5665,
                longitude: 126.978,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }
        }
      />
    ),
    []
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#F5F6F8" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {isReady && (
          <View style={styles.countdownOverlay}>
            <Text style={[styles.countdownText, { color: "#4A6EA9" }]}>
              {countdown > 0 ? countdown : "GO!"}
            </Text>
            <Text style={styles.countdownLabel}>티어 측정 준비!</Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 섹션 */}
          <View style={styles.header}>
            <View style={[styles.statusTag, { backgroundColor: "#4A6EA9" }]}>
              <View style={[styles.statusDot, { backgroundColor: "#FFF" }]} />
              <Text style={[styles.statusText, { color: "#FFF" }]}>
                {isPaused ? "일시정지" : "티어 측정 중"}
              </Text>
            </View>
          </View>

          {/* 통계 섹션 */}
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
              label="남은 거리"
              value={(remainingDistance / 1000).toFixed(2)}
              unit="km"
              highlight
            />
            <StatBox
              icon={<FontAwesome5 name="running" size={22} color="#4A6EA9" />}
              label="페이스"
              value={formatPace(currentPace)}
              unit="/km"
            />
          </View>

          {/* 페이스 차트 */}
          <View style={styles.chartCard}>
            <View style={styles.chartTitleContainer}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={isDarkMode ? "#FFF" : "#333"}
              />
              <Text style={styles.chartTitle}>페이스 분석</Text>
            </View>
            <LineChart
              data={{
                labels: [],
                datasets: [
                  {
                    data: paceHistory.length > 0 ? paceHistory : [0],
                    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
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
          </View>

          {/* 지도 섹션 및 토글 버튼 */}
          <View style={styles.mapContainer}>
            {renderedMap}

            {/* 수정: 내 위치 토글 버튼 */}
            <TouchableOpacity
              style={[
                customStyles.locationButton,
                {
                  backgroundColor: isTracking
                    ? "#4A6EA9"
                    : isDarkMode
                    ? "#333"
                    : "#FFF",
                },
              ]}
              onPress={moveToCurrentLocation}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={24}
                color={isTracking ? "#FFF" : isDarkMode ? "#AAA" : "#333"}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!isReady && (
          <View style={styles.controlContainer}>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={isPaused ? resumeRun : pauseRun}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={36}
                color="#4A6EA9"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: "#FF3B30" }]}
              onPress={handleStopPress}
              onLongPress={stopTierRunManual}
              delayLongPress={1000}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: "white",
                  borderRadius: 4,
                }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// 추가 스타일
const customStyles = StyleSheet.create({
  locationButton: {
    position: "absolute",
    right: 15,
    bottom: 15,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default TierRunningScreen;
