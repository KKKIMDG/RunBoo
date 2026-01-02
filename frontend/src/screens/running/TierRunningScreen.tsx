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
import { useTierRunningScreen } from "./useTierRunningScreen";
import { getStyles } from "./RunningScreen.styles";
import { StatBox } from "@/components/StatBox";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const chartConfig = {
    backgroundColor: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Gold 테마
    labelColor: (opacity = 1) => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#F5F6F8" }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={[styles.container, { flex: 1 }]}>
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
                  티어 측정 중
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

            <View style={styles.statsContainer}>
              <StatBox
                icon={
                  <Ionicons name="time-outline" size={24} color="#4A6EA9" />
                }
                label="시간"
                value={formatTime(time)}
              />
              <StatBox
                icon={
                  <MaterialCommunityIcons
                    name="flag-checkered"
                    size={24}
                    color="#FFD700"
                  />
                }
                label="남은 거리"
                value={(remainingDistance / 1000).toFixed(2)}
                unit="km"
                highlight={true}
              />
              <StatBox
                icon={<FontAwesome5 name="running" size={22} color="#FFD700" />}
                label="페이스"
                value={formatPace(currentPace)}
                unit="/km"
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
                    { data: paceHistory.length > 0 ? paceHistory : [0] },
                  ],
                }}
                width={width - 80}
                height={150}
                chartConfig={chartConfig}
                bezier
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={false}
                style={{ marginLeft: -20 }}
              />
            </View>

            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                followsUserLocation={true}
                region={
                  routeCoordinates.length > 0
                    ? {
                        latitude:
                          routeCoordinates[routeCoordinates.length - 1]
                            .latitude,
                        longitude:
                          routeCoordinates[routeCoordinates.length - 1]
                            .longitude,
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
        </View>
      </SafeAreaView>

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
    </View>
  );
};

export default TierRunningScreen;
