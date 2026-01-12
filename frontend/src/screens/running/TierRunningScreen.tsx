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
  // ✅ 테마 관리 방식 변경
  const colorScheme = useColorScheme() ?? "light";
  const isDarkMode = colorScheme === "dark";
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

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
    initialLocation,
  } = state;

  const cadence = useCadence({
    enabled: !isReady && !isPaused,
    windowSec: 5,
  });

  // ✅ 종료 순간 케이던스 고정 저장용
  const finalCadenceRef = useRef<number>(0);

  useEffect(() => {
      if (typeof cadence === "number" && isFinite(cadence)) {
          finalCadenceRef.current = cadence;
      }
  }, [cadence]);

  const { pauseRun, resumeRun, stopTierRunManual } = actions;
  const { formatTime, formatPace } = utils;

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
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: isDarkMode ? "#17263c" : "#c9d1d9" }],
    },
  ];

  useEffect(() => {
    if (initialLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...initialLocation, latitudeDelta: 0.002, longitudeDelta: 0.002 },
        500
      );
    }
  }, [initialLocation]);

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
        { ...lastLocation, latitudeDelta: 0.002, longitudeDelta: 0.002 },
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

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {isReady && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>
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
          <View
            style={[
              styles.statusTag,
              { backgroundColor: "#4A6EA9", borderWidth: 0 },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: "#FFF" }]} />
            <Text style={[styles.statusText, { color: "#FFF" }]}>
              {isPaused ? "일시정지" : "티어 측정 중"}
            </Text>
          </View>
        </View>

        {/* ✅ 이미지 스타일이 적용된 Stats Container */}
        <View style={styles.statsContainer}>
          <StatBox
            icon={<Ionicons name="time-outline" size={20} color="#8E8E93" />}
            label="시간"
            value={formatTime(time)}
          />
          <StatBox
            icon={
              <MaterialCommunityIcons name="target" size={20} color="#2D3269" />
            }
            label="남은 거리"
            value={(remainingDistance / 1000).toFixed(2)}
            unit="km"
            highlight
          />
          <StatBox
            icon={<FontAwesome5 name="running" size={18} color="#1A1A1A" />}
            label="페이스"
            value={formatPace(currentPace)}
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="shoe-print"
                size={20}
                color="#8E8E93"
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
              datasets: [{ data: paceHistory.length > 0 ? paceHistory : [0] }],
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
            <View style={customStyles.loadingBox}>
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
            style={styles.stopButton}
            onPress={handleStopPress}
            onLongPress={() =>
                stopTierRunManual(Math.round(finalCadenceRef.current ?? 0))
            }
            delayLongPress={1000}
          >
            <View style={customStyles.stopSquare} />
          </TouchableOpacity>
        </View>
      )}
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
  stopSquare: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 4,
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TierRunningScreen;
