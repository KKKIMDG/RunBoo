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
  ActivityIndicator,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, MapStyleElement } from "react-native-maps";
import { LineChart } from "react-native-chart-kit";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { useTierRunningScreen } from "./useTierRunningScreen";
import { getStyles } from "./RunningScreen.styles";
import { StatBox } from "@/components/StatBox";

import { useCadence } from "@/hooks/useCadence";

const { width } = Dimensions.get("window");

const TierRunningScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const styles = getStyles(isDarkMode);

  const mapRef = useRef<MapView>(null);
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
    initialLocation, // useTierRunningScreen에서 가져옴
  } = state;

    // 케이던스 관련 훅
    const cadence = useCadence({
        enabled: !isReady && !isPaused,
        windowSec: 5,
    });

  const { pauseRun, resumeRun, stopTierRunManual } = actions;
  const { formatTime, formatPace } = utils;

  // ✅ 일반 러닝과 동일한 지도 스타일 정의
  const blurredMapStyle: MapStyleElement[] = [
    {
      elementType: "geometry",
      stylers: [{ color: isDarkMode ? "#242f3e" : "#f0f0f0" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { visibility: "on" },
        { color: isDarkMode ? "#38414e" : "#ffffff" },
        { weight: 1.5 },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: isDarkMode ? "#9ca5b3" : "#757575" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: isDarkMode ? "#17263c" : "#c9d1d9" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry",
      stylers: [
        { visibility: "on" },
        { color: isDarkMode ? "#2c3e50" : "#e0e0e0" },
      ],
    },
  ];

  // ✅ 초기 위치 포커싱 (서울 시청 방지)
  useEffect(() => {
    if (initialLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...initialLocation,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        500
      );
    }
  }, [initialLocation]);

  // ✅ 실시간 자동 추적
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

  const moveToCurrentLocation = async () => {
    setIsTracking(true);
    if (lastLocation) {
      mapRef.current?.animateToRegion(
        {
          ...lastLocation,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        500
      );
    } else {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
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

  /** ✅ 기존 금색 차트 설정 유지 */
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

  // ✅ 지도 렌더링 (스타일 및 오버레이 적용)
  const renderedMap = useMemo(
    () => (
      <View style={StyleSheet.absoluteFill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          showsUserLocation={true}
          customMapStyle={
            Platform.OS === "android" ? blurredMapStyle : undefined
          }
          onPanDrag={() => setIsTracking(false)}
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
        {/* 반투명 오버레이 */}
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
    [initialLocation, isDarkMode]
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
          <View style={styles.header}>
            <View style={[styles.statusTag, { backgroundColor: "#4A6EA9" }]}>
              <View style={[styles.statusDot, { backgroundColor: "#FFF" }]} />
              <Text style={[styles.statusText, { color: "#FFF" }]}>
                {isPaused ? "일시정지" : "티어 측정 중"}
              </Text>
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
              <Text style={styles.chartTitle}>페이스 분석</Text>
            </View>
            <LineChart
              data={{
                labels: [],
                datasets: [
                  {
                    data: paceHistory.length > 0 ? paceHistory : [0],
                    color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
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
              onLongPress={stopTierRunManual} // 기존 로직 유지
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
    zIndex: 10,
  },
});

export default TierRunningScreen;
