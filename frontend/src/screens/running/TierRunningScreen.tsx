import React, { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ToastAndroid,
  Platform,
  StyleSheet,
  ActivityIndicator,
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
import { useCadence } from "@/hooks/useCadence";
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { useMapFocusing } from "./useRunCore";
import { darkMapStyle, lightMapStyle } from "@/screens/Home/mapStyles";
import {useBlockBack} from "@/hooks/useBlockBack";

const { width } = Dimensions.get("window");

const TierRunningScreen = () => {
  useBlockBack();
  const { settings } = useSettings();
  const colorScheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  const isDarkMode = colorScheme === "dark";
  const mapRef = useRef<MapView>(null);

  const { state, actions, utils } = useTierRunningScreen();

  const {
    isPaused,
    time,
    remainingDistance,
    currentPace,
    paceHistory,
    isReady,
    countdown,
    initialLocation,
    routeCoordinates,
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

  const { stopTierRunManual } = actions;
  const { formatTime, formatPace } = utils;

  const cadence = useCadence({
    enabled: !isReady && !isPaused,
    windowSec: 5,
  });

  // ✅ cadence 샘플을 훅에 전달 (평균 계산은 훅에서)
  useEffect(() => {
    actions.pushCadenceSample(cadence);
  }, [cadence]);

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
          customMapStyle={colorScheme === "dark" ? darkMapStyle : lightMapStyle}
          onPanDrag={() => mapFocusing.setIsFollowing(false)}
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
    [initialLocation, isDarkMode],
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
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
              borderColor: isDarkMode ? "#333" : "#E5E7EB",
            },
          ]}
        >
          <View
            style={[
              styles.headerPill,
              {
                backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                borderColor: isDarkMode ? "#333" : "#E5E7EB",
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: "#4A6EA9" }]} />
            <Text
              style={[
                styles.headerPillText,
                { color: isDarkMode ? "#fff" : "#1a1a1a" },
              ]}
            >
              {isPaused ? "일시정지" : "티어 측정 중"}
            </Text>
          </View>
        </View>

        {/* 지도 영역 */}
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

        {/* 메인 통계: 시간과 남은 거리 */}
        <View style={styles.mainStatsArea}>
          <View style={styles.mainStatItem}>
            <Ionicons name="time-outline" size={16} color="#8E8E93" />
            <Text style={styles.mainStatLabel}>시간</Text>
            <Text style={styles.mainStatTime}>{formatTime(time)}</Text>
          </View>
          <View style={styles.mainStatItem}>
            <MaterialCommunityIcons name="target" size={16} color="#8E8E93" />
            <Text style={styles.mainStatLabel}>남은 거리</Text>
            <Text style={styles.mainStatValueLarge}>
              {(remainingDistance / 1000).toFixed(2)}
            </Text>
            <Text style={styles.mainStatUnit}>km</Text>
          </View>
        </View>

        {/* 페이스 변화 차트 */}
        <View style={styles.chartCard}>
          <View style={styles.chartTitleContainer}>
            <MaterialCommunityIcons
              name="chart-line"
              size={16}
              color={isDarkMode ? "#FFF" : "#333"}
            />
            <Text style={styles.chartTitle}>페이스 변화</Text>
          </View>
          <LineChart
            data={{
              labels: [],
              datasets: [{ data: paceHistory.length > 0 ? paceHistory : [0] }],
            }}
            width={width - 48}
            height={120}
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
              현재 페이스: {formatPace(currentPace)}/km
            </Text>
          </View>
        </View>

        {/* 페이스와 케이던스 */}
        <View style={styles.bottomStats}>
          <View style={styles.bottomStatItem}>
            <FontAwesome5 name="running" size={14} color="#8E8E93" />
            <Text style={styles.bottomStatLabel}>페이스</Text>
            <Text style={styles.bottomStatValue}>
              {formatPace(currentPace)}
            </Text>
            <Text style={styles.bottomStatUnit}>"/km</Text>
          </View>
          <View style={styles.bottomStatItem}>
            <MaterialCommunityIcons
              name="shoe-print"
              size={14}
              color="#8E8E93"
            />
            <Text style={styles.bottomStatLabel}>케이던스</Text>
            <Text style={styles.bottomStatValue}>{cadence}</Text>
            <Text style={styles.bottomStatUnit}>spm</Text>
          </View>
        </View>

        {/* 하단 컨트롤 버튼 */}
        {!isReady && (
          <View style={styles.controlContainer}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={() => {
                Alert.alert("티어 측정 종료", "티어 측정을 종료하시겠습니까?", [
                  {
                    text: "취소",
                    style: "cancel",
                  },
                  {
                    text: "종료",
                    onPress: stopTierRunManual,
                    style: "destructive",
                  },
                ]);
              }}
            >
              <Text style={styles.buttonTextWhite}>측정 종료</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TierRunningScreen;
