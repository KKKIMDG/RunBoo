import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
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
import { useRunningVoiceFeedback } from "@/hooks/useRunningVoiceFeedback";
import * as Speech from "expo-speech";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Running">;

const RunningScreen = () => {
  const isDarkMode = useColorScheme() === "dark";
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);

  const [isMale, setIsMale] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

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
    isFollowing,
    initialLocation,
    targetDistance,
  } = state;

  const {
    pauseRun,
    resumeRun,
    stopRun,
    toggleFollowing,
    setIsFollowing,
    onLocationUpdate,
  } = actions;
  const { formatTime, formatPace } = utils;

  const { checkAndSpeak, speakStart, speakPause, speakResume, speakStop } =
    useRunningVoiceFeedback({
      isMale: isMale,
      targetDistance: targetDistance,
    });

  const toggleVoice = () => {
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
      speakStart();
    }
    prevIsReady.current = isReady;
  }, [isReady, isVoiceEnabled]);

  useEffect(() => {
    if (isVoiceEnabled && !isPaused && !isReady && distance > 0) {
      checkAndSpeak(distance);
    }
  }, [distance, isPaused, isReady, isVoiceEnabled]);

  const prevIsPaused = useRef(isPaused);
  useEffect(() => {
    if (isVoiceEnabled && !isReady && prevIsPaused.current !== isPaused) {
      if (isPaused) speakPause();
      else speakResume();
    }
    prevIsPaused.current = isPaused;
  }, [isPaused, isReady, isVoiceEnabled]);

  useEffect(() => {
    onLocationUpdate.current = (coords) => {
      if (isFollowing && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...coords,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          },
          1000
        );
      }
    };
  }, [isFollowing]);

  const handleFocusPress = () => {
    toggleFollowing();
    if (!isFollowing && routeCoordinates.length > 0) {
      const last = routeCoordinates[routeCoordinates.length - 1];
      mapRef.current?.animateToRegion(
        {
          ...last,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        500
      );
    }
  };

  const renderedMap = useMemo(
    () => (
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        loadingEnabled={true}
        onPanDrag={() => {
          if (isFollowing) setIsFollowing(false);
        }}
        initialRegion={
          initialLocation
            ? {
                ...initialLocation,
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
    [initialLocation]
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

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1E1E1E" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1E1E1E" : "#ffffff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74,110,169,${opacity})`,
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" },
  };

  const handleStopLongPress = () => {
    if (isVoiceEnabled) {
      // ✅ 하던 말을 훅 내부 speak에서 끊어주므로 바로 호출
      speakStop(distance, () => {
        stopRun();
      });
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
              onPress={() => setIsMale(!isMale)}
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
          {renderedMap}
          <TouchableOpacity
            style={[
              customStyles.focusButton,
              isFollowing && customStyles.focusButtonActive,
            ]}
            onPress={handleFocusPress}
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
