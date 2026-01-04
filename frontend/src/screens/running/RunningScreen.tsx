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
  SafeAreaView,
} from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { LineChart } from "react-native-chart-kit";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useRunningScreen } from "./useRunningScreen";
import { getStyles } from "./RunningScreen.styles";
import { StatBox } from "@/components/StatBox";
import { RootStackParamList } from "@/navigation/root/RootNavigator";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Running">;

const RunningScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation<NavigationProp>();

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
  } = state;

  const { pauseRun, resumeRun, stopRun } = actions;
  const { formatTime, formatPace } = utils;

  const handleStopPress = () => {
    const msg = "종료하려면 버튼을 1초간 길게 누르세요";
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("알림", msg);
    }
  };

  const handleStopLongPress = () => {
    stopRun();
    navigation.navigate("RunResult", {
      distanceM: distance,
      durationSec: time,
      avgPaceSec: currentPace,
      calories: Math.floor(distance * 0.06),
      routeCoordinates,
    });
  };

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74,110,169,${opacity})`,
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

  const chartData = {
    labels: [],
    datasets: [
      {
        data: paceHistory.length > 0 ? paceHistory : [0],
        color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 카운트다운 오버레이 (준비 중일 때만 표시) */}
      {isReady && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>
            {countdown > 0 ? countdown : "GO!"}
          </Text>
          <Text style={styles.countdownLabel}>준비하세요!</Text>
        </View>
      )}

      {/* 2. 메인 컨텐츠 */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더: 상태 표시 */}
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
        </View>

        {/* 대시보드: 주요 통계 */}
        <View style={styles.statsContainer}>
          <StatBox
            icon={<Ionicons name="time-outline" size={24} color="#4A6EA9" />}
            label="시간"
            value={formatTime(time)}
          />
          <StatBox
            icon={
              <MaterialCommunityIcons
                name="map-marker-distance"
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
        </View>

        {/* 데이터 시각화: 차트 */}
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

        {/* 경로 표시: 지도 */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            followsUserLocation={!isPaused}
            loadingEnabled={true}
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

      {/* 3. 하단 컨트롤 바 */}
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
          onLongPress={handleStopLongPress}
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
    </SafeAreaView>
  );
};

export default RunningScreen;
