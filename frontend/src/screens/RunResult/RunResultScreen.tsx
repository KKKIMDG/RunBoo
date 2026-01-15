import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

type RunResultRouteParams = {
  distanceM: number;
  durationSec: number;
  avgPaceSec: number;
  calories: number;
  routeCoordinates: Coordinate[];
  cadenceSpm: number;
};

type RunResultRouteProp = RouteProp<{ params: RunResultRouteParams }, "params">;

const RunResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RunResultRouteProp>();
  const {
    distanceM,
    durationSec,
    avgPaceSec,
    calories,
    routeCoordinates,
    cadenceSpm,
  } = route.params;
  const { settings } = useSettings();
  const systemColorScheme = useColorScheme();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(resolvedTheme, settings?.fontSize || "MEDIUM");
  }, [resolvedTheme, settings?.fontSize]);

  // 지도 위 통계만 시스템 테마 따라가기
  const isSystemDark = systemColorScheme === "dark";

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
        edgePadding: { top: 180, right: 60, bottom: 60, left: 60 }, // 텍스트 공간 확보를 위해 top 패딩 상향
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

  const isDarkMode = resolvedTheme === "dark";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={storyRef}
          options={{ format: "png", quality: 1.0 }}
          style={{
            width: "100%",
            backgroundColor: styles.container.backgroundColor,
          }}
        >
          {/* --- 로고 이미지 --- */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/runboo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          {/* --- 지도 및 요약 통계(겹침) --- */}
          <View style={styles.mapContainer}>
            {routeCoordinates && routeCoordinates.length > 0 && midCoord ? (
              <>
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
                          borderWidth: 2,
                          borderColor: "#fff",
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
                          borderWidth: 2,
                          borderColor: "#fff",
                        }}
                      />
                    </Marker>
                  )}
                </MapView>

                {/* ✅ 지도 위에 겹쳐진 요약 통계 영역 */}
                <View style={styles.statsOverlay}>
                  <View style={styles.overlayItem}>
                    <Text
                      style={[
                        styles.overlayLabel,
                        { color: isSystemDark ? "#AAAAAA" : "#666666" },
                      ]}
                    >
                      거리
                    </Text>
                    <View style={styles.overlayValueRow}>
                      <Text
                        style={[
                          styles.overlayValue,
                          { color: isSystemDark ? "#FFFFFF" : "#1A1A1A" },
                        ]}
                      >
                        {(distanceM / 1000).toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.overlayUnit,
                          { color: isSystemDark ? "#AAAAAA" : "#666666" },
                        ]}
                      >
                        km
                      </Text>
                    </View>
                  </View>

                  <View style={styles.overlayItem}>
                    <Text
                      style={[
                        styles.overlayLabel,
                        { color: isSystemDark ? "#AAAAAA" : "#666666" },
                      ]}
                    >
                      시간
                    </Text>
                    <Text
                      style={[
                        styles.overlayValue,
                        { color: isSystemDark ? "#FFFFFF" : "#1A1A1A" },
                      ]}
                    >
                      {formatTime(durationSec)}
                    </Text>
                  </View>

                  <View style={styles.overlayItem}>
                    <Text
                      style={[
                        styles.overlayLabel,
                        { color: isSystemDark ? "#AAAAAA" : "#666666" },
                      ]}
                    >
                      페이스
                    </Text>
                    <Text
                      style={[
                        styles.overlayValue,
                        { color: isSystemDark ? "#FFFFFF" : "#1A1A1A" },
                      ]}
                    >
                      {formatPace(avgPaceSec)}
                    </Text>
                  </View>
                </View>

                {/* 경로 포커스 버튼 */}
                <TouchableOpacity
                  style={styles.mapActionIcon}
                  onPress={handleFocusRoute}
                >
                  <MaterialCommunityIcons
                    name="near-me"
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.mapPlaceholderContainer}>
                <Ionicons
                  name="map-outline"
                  size={40}
                  color={styles.placeholderSubtitle.color}
                />
                <Text style={styles.placeholderTitle}>
                  경로 정보가 없습니다
                </Text>
                <Text style={styles.placeholderSubtitle}>
                  기록 중 위치 정보가 저장되지 않았습니다. GPS 권한이나 연결
                  상태를 확인해 주세요.
                </Text>
              </View>
            )}
          </View>

          {/* --- 하단 정보 (평균속도/칼로리/케이던스) --- */}
          <View style={styles.bottomInfoContainer}>
            <View style={styles.bottomInfoItem}>
              <Text style={styles.bottomInfoLabel}>평균 속도</Text>
              <View style={styles.bottomInfoValueRow}>
                <Text style={styles.bottomInfoValue}>
                  {avgSpeedKmh.toFixed(1)}
                </Text>
                <Text style={styles.bottomInfoUnit}>km/h</Text>
              </View>
            </View>
            <View style={styles.bottomInfoItem}>
              <Text style={styles.bottomInfoLabel}>칼로리</Text>
              <View style={styles.bottomInfoValueRow}>
                <Text style={styles.bottomInfoValue}>{calories}</Text>
                <Text style={styles.bottomInfoUnit}>kcal</Text>
              </View>
            </View>
            <View style={styles.bottomInfoItem}>
              <Text style={styles.bottomInfoLabel}>케이던스</Text>
              <View style={styles.bottomInfoValueRow}>
                <Text style={styles.bottomInfoValue}>
                  {Math.round(cadenceSpm ?? 0)}
                </Text>
                <Text style={styles.bottomInfoUnit}>spm</Text>
              </View>
            </View>
          </View>
        </ViewShot>

        {/* --- 버튼 영역 --- */}
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
