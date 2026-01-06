import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";

import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { getStyles } from "./RunResultScreen.styles";
import { Coordinate } from "@/utils/runUtils";

type RunResultRouteParams = {
  distanceM: number;
  durationSec: number;
  avgPaceSec: number;
  calories: number;
  routeCoordinates: Coordinate[];
};

type RunResultRouteProp = RouteProp<{ params: RunResultRouteParams }, "params">;

const RunResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RunResultRouteProp>();
  const { distanceM, durationSec, avgPaceSec, calories, routeCoordinates } =
    route.params;

  const isDarkMode = useColorScheme() === "dark";
  const styles = getStyles(isDarkMode);
  const iconColor = isDarkMode ? "#FFFFFF" : "#333333";

  const shareRef = useRef<View>(null);
  const storyRef = useRef<any>(null);
  const mapRef = useRef<MapView>(null);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m < 10 ? "0" + m : m}:${
      s < 10 ? "0" + s : s
    }`;
  };

  const formatPace = (paceInSeconds: number) => {
    if (paceInSeconds === 0 || !isFinite(paceInSeconds)) return "-'--\"";
    const m = Math.floor(paceInSeconds / 60);
    const s = Math.floor(paceInSeconds % 60);
    return `${m}'${s < 10 ? "0" + s : s}"`;
  };

  const avgSpeedKmh =
    distanceM > 0 && durationSec > 0
      ? distanceM / 1000 / (durationSec / 3600)
      : 0;

  const midIdx = Math.floor(routeCoordinates.length / 2);
  const midCoord =
    routeCoordinates.length > 0 ? routeCoordinates[midIdx] : null;

  const startCoord = routeCoordinates.length > 0 ? routeCoordinates[0] : null;
  const endCoord =
    routeCoordinates.length > 0
      ? routeCoordinates[routeCoordinates.length - 1]
      : null;

  const handleGoHome = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainStack" as never }] });
  };

  const handleFocusRoute = () => {
    if (routeCoordinates && routeCoordinates.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  };

  const blurredMapStyle = [
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

  const handleShare = async () => {
    try {
      if (storyRef.current) {
        const uri = await captureRef(storyRef, {
          format: "png",
          quality: 1.0,
          width: 1080,
          height: 1920,
        });
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("공유 실패:", error);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#000" : "#fff" }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View ref={shareRef} collapsable={false}>
          <View style={localStyles.profileSection}>
            <View style={localStyles.imageWrapper}>
              <Image
                source={require("@/assets/images/runboo.png")}
                style={localStyles.mainImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.titleText}>러닝 완료!</Text>
            <Text style={styles.subtitleText}>Run Boo!</Text>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={28}
                color={iconColor}
              />
              <Text style={styles.summaryLabel}>거리</Text>
              <Text style={styles.summaryValue}>
                {(distanceM / 1000).toFixed(2)}
              </Text>
              <Text style={styles.summaryUnit}>km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={28} color={iconColor} />
              <Text style={styles.summaryLabel}>시간</Text>
              <Text style={styles.summaryValue}>{formatTime(durationSec)}</Text>
              <Text style={styles.summaryUnit}>분:초</Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome5 name="running" size={24} color={iconColor} />
              <Text style={styles.summaryLabel}>페이스</Text>
              <Text style={styles.summaryValue}>{formatPace(avgPaceSec)}</Text>
              <Text style={styles.summaryUnit}>/km</Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            {routeCoordinates && routeCoordinates.length > 0 && midCoord ? (
              <View style={StyleSheet.absoluteFill}>
                <MapView
                  ref={mapRef}
                  style={StyleSheet.absoluteFill}
                  provider={PROVIDER_GOOGLE}
                  onMapReady={handleFocusRoute}
                  customMapStyle={blurredMapStyle}
                  initialRegion={{
                    latitude: midCoord.latitude,
                    longitude: midCoord.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                  }}
                >
                  {/* 1. ✅ 바닥 그림자 레이어: 경로의 깊이감을 줌 */}
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="rgba(0,0,0,0.1)"
                    strokeWidth={16}
                  />

                  {/* 2. ✅ 메인 발광 레이어 (Semi-transparent): 겹칠수록 밝아짐 */}
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={
                      isDarkMode
                        ? "rgba(100, 150, 255, 0.4)"
                        : "rgba(74, 110, 169, 0.4)"
                    }
                    strokeWidth={10}
                  />

                  {/* 3. ✅ 핵심 경로 레이어 (High Brightness): 겹치는 곳을 더 밝게 표현 */}
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={
                      isDarkMode
                        ? "rgba(180, 210, 255, 0.6)"
                        : "rgba(120, 160, 220, 0.5)"
                    }
                    strokeWidth={6}
                  />

                  {/* 4. ✅ 센터 하이라이트: 아주 얇은 선으로 경로의 중심을 잡음 */}
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="rgba(255, 255, 255, 0.7)"
                    strokeWidth={2}
                  />

                  {startCoord && (
                    <Marker coordinate={startCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={localStyles.markerCircle}>
                        <View
                          style={[
                            localStyles.markerInner,
                            { backgroundColor: "#4CAF50" },
                          ]}
                        />
                      </View>
                    </Marker>
                  )}

                  {endCoord && (
                    <Marker coordinate={endCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={localStyles.markerCircle}>
                        <View
                          style={[
                            localStyles.markerInner,
                            { backgroundColor: "#FF3B30" },
                          ]}
                        />
                      </View>
                    </Marker>
                  )}
                </MapView>

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

                <TouchableOpacity
                  style={localStyles.focusButton}
                  onPress={handleFocusRoute}
                >
                  <MaterialCommunityIcons
                    name="altimeter"
                    size={24}
                    color="#4A6EA9"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.mapPlaceholderText}>
                경로 정보가 없습니다.
              </Text>
            )}
          </View>

          <View style={styles.bottomInfoContainer}>
            <View style={styles.bottomInfoCard}>
              <Text style={styles.bottomInfoLabel}>칼로리</Text>
              <Text style={styles.bottomInfoValue}>{calories} kcal</Text>
            </View>
            <View style={styles.bottomInfoCard}>
              <Text style={styles.bottomInfoLabel}>평균 속도</Text>
              <Text style={styles.bottomInfoValue}>
                {avgSpeedKmh.toFixed(1)} km/h
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#FFF" />
            <Text style={styles.shareButtonText}>기록 공유하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Ionicons name="home-outline" size={24} color={iconColor} />
            <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  profileSection: { alignItems: "center", marginTop: 20, marginBottom: 10 },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 10,
  },
  mainImage: { width: "100%", height: "100%", backgroundColor: "#FFFFFF" },
  focusButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  markerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default RunResultScreen;
