import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import MapView, {
  Polyline,
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";

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
  const colorScheme = useColorScheme() ?? "light";
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

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

  const handleShare = async () => {
    try {
      if (storyRef.current) {
        const uri = await captureRef(storyRef, {
          format: "png",
          quality: 1.0,
          result: "tmpfile",
        });
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "나의 러닝 기록 공유하기",
          UTI: "public.png",
        });
      }
    } catch (error) {
      console.error("공유 실패:", error);
    }
  };

  const isDarkMode = colorScheme === "dark";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={storyRef}
          options={{ format: "png", quality: 1.0 }}
          style={{ width: "100%" }}
        >
          {/* --- 상단 프로필 영역 --- */}
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require("@/assets/images/runboo.png")}
                style={styles.profileImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.titleText}>러닝 완료!</Text>
            <Text style={styles.subtitleText}>Run Boo!</Text>
          </View>

          {/* --- 요약 통계 --- */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                style={styles.icon}
              />
              <Text style={styles.summaryLabel}>거리</Text>
              <Text style={styles.summaryValue}>
                {(distanceM / 1000).toFixed(2)}
              </Text>
              <Text style={styles.summaryUnit}>km</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" style={styles.icon} />
              <Text style={styles.summaryLabel}>시간</Text>
              <Text style={styles.summaryValue}>{formatTime(durationSec)}</Text>
              <Text style={styles.summaryUnit}>분:초</Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome5 name="running" style={styles.icon} />
              <Text style={styles.summaryLabel}>페이스</Text>
              <Text style={styles.summaryValue}>{formatPace(avgPaceSec)}</Text>
              <Text style={styles.summaryUnit}>/km</Text>
            </View>
          </View>

          {/* --- 지도 --- */}
          <View style={styles.mapContainer}>
            {routeCoordinates && routeCoordinates.length > 0 && midCoord ? (
              <View style={StyleSheet.absoluteFill}>
                <MapView
                  ref={mapRef}
                  style={StyleSheet.absoluteFill}
                  provider={
                    Platform.OS === "android"
                      ? PROVIDER_GOOGLE
                      : PROVIDER_DEFAULT
                  }
                  onMapReady={handleFocusRoute}
                  initialRegion={{
                    latitude: midCoord.latitude,
                    longitude: midCoord.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                  }}
                >
                  {/* 여러 레이어 Polyline */}
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="rgba(0,0,0,0.1)"
                    strokeWidth={16}
                  />
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={
                      isDarkMode
                        ? "rgba(100,150,255,0.4)"
                        : "rgba(74,110,169,0.4)"
                    }
                    strokeWidth={10}
                  />
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={
                      isDarkMode
                        ? "rgba(180,210,255,0.6)"
                        : "rgba(120,160,220,0.5)"
                    }
                    strokeWidth={6}
                  />
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="rgba(255,255,255,0.7)"
                    strokeWidth={2}
                  />

                  {startCoord && (
                    <Marker coordinate={startCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: "#4CAF50",
                        }}
                      />
                    </Marker>
                  )}
                  {endCoord && (
                    <Marker coordinate={endCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: "#FF3B30",
                        }}
                      />
                    </Marker>
                  )}
                </MapView>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    backgroundColor: "#FFFFFF",
                    padding: 10,
                    borderRadius: 30,
                    elevation: 5,
                  }}
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

          {/* --- 하단 정보 --- */}
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
        </ViewShot>

        {/* --- 버튼 --- */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#FFF" />
            <Text style={styles.shareButtonText}>기록 공유하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Ionicons name="home-outline" size={24} color={styles.icon.color} />
            <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RunResultScreen;
