import React from "react";
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
} from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
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

  const { state, actions, utils } = useTierRunningScreen();

  const {
    isPaused,
    time,
    remainingDistance,
    currentPace,
    routeCoordinates,
    paceHistory,
    isReady,
    countdown,
  } = state;

  const { pauseRun, resumeRun, stopTierRunManual } = actions;
  const { formatTime, formatPace } = utils;

  const handleStopPress = () => {
    const msg = "종료하려면 버튼을 길게 눌러주세요.";
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert("알림", msg);
  };

  /** 차트 설정 (골드 테마 적용) */
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Gold 포인트
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#F5F6F8" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* 1. 카운트다운 오버레이 */}
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
            <TouchableOpacity style={styles.soundButton}>
              <Ionicons
                name="volume-medium"
                size={24}
                color={isDarkMode ? "#FFF" : "#333"}
              />
            </TouchableOpacity>
          </View>

          {/* 통계 섹션 (티어 전용 아이콘 및 색상) */}
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

          {/* 페이스 분석 차트 */}
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
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabelText}>시작</Text>
              <Text style={styles.chartLabelText}>
                현재: {formatPace(currentPace)}/km
              </Text>
            </View>
          </View>

          {/* 지도 섹션 */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              showsUserLocation
              followsUserLocation={!isPaused}
              region={
                routeCoordinates.length > 0
                  ? {
                      latitude:
                        routeCoordinates[routeCoordinates.length - 1].latitude,
                      longitude:
                        routeCoordinates[routeCoordinates.length - 1].longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }
                  : undefined
              }
            >
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4A6EA9"
                strokeWidth={5}
              />
            </MapView>
          </View>
        </ScrollView>

        {/* 3. 하단 컨트롤러 (준비 중이 아닐 때만 표시) */}
        {!isReady && (
          <View style={styles.controlContainer}>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={isPaused ? resumeRun : pauseRun}
              activeOpacity={0.7}
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
              activeOpacity={0.8}
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

export default TierRunningScreen;
