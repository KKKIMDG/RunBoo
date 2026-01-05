import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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

  // 초기 로드 시 줌 레벨
  const MAP_ZOOM_LEVEL = 0.015;

  const handleGoHome = () => {
    navigation.reset({ index: 0, routes: [{ name: "MainStack" as never }] });
  };

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

  const StoryCapture = () => {
    const bg = isDarkMode ? "#070A12" : "#F6F7FB";
    const strong = isDarkMode ? "#FFFFFF" : "#111111";
    return (
      <View style={{ position: "absolute", left: -9999 }}>
        <ViewShot
          ref={storyRef}
          style={{ width: 360, height: 640, backgroundColor: bg }}
        >
          <View style={{ flex: 1, padding: 20, alignItems: "center" }}>
            <Image
              source={require("@/assets/images/runboo.png")}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: strong,
                fontSize: 24,
                fontWeight: "900",
                marginTop: 10,
              }}
            >
              러닝 완료!
            </Text>
          </View>
        </ViewShot>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? "#000" : "#fff" }}
    >
      <StoryCapture />
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

          {/* 요약 데이터 */}
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

          {/* 지도 영역 - 유동적으로 조작 가능하도록 수정 */}
          <View style={styles.mapContainer}>
            {routeCoordinates.length > 0 && midCoord ? (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                // ✅ 유동적 조작 활성화
                scrollEnabled={true}
                zoomEnabled={true}
                rotateEnabled={true}
                pitchEnabled={true}
                initialRegion={{
                  latitude: midCoord.latitude,
                  longitude: midCoord.longitude,
                  latitudeDelta: MAP_ZOOM_LEVEL,
                  longitudeDelta: MAP_ZOOM_LEVEL,
                }}
              >
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#4A6EA9"
                  strokeWidth={5}
                />
              </MapView>
            ) : (
              <Text style={styles.mapPlaceholderText}>
                경로 정보가 없습니다.
              </Text>
            )}
          </View>

          {/* 추가 정보 */}
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

        {/* 버튼 */}
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
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
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
  mainImage: {
    width: "100%",
    height: "100%",
  },
});

export default RunResultScreen;
