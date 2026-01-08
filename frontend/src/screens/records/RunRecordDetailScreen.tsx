import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { fetchRunRecordDetail } from "@/services/record/recordsService";
import type { RunRecordDetailDto } from "@/types/record";
import { decodePolyline, LatLng } from "@/utils/polyline";

type Params = { recordId: number };
type R = RouteProp<{ params: Params }, "params">;

export default function RunRecordDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<R>();
  const recordId = route?.params?.recordId;

  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RunRecordDetailDto | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const coords: LatLng[] = useMemo(() => {
    const poly = data?.routePolyline ?? "";
    try {
      return decodePolyline(poly);
    } catch {
      return [];
    }
  }, [data?.routePolyline]);

  const midCoord =
    coords.length > 0 ? coords[Math.floor(coords.length / 2)] : null;
  const startCoord = coords.length > 0 ? coords[0] : null;
  const endCoord = coords.length > 0 ? coords[coords.length - 1] : null;

  useEffect(() => {
    (async () => {
      try {
        setErrorText(null);
        setLoading(true);
        const res = (await fetchRunRecordDetail(
          Number(recordId)
        )) as RunRecordDetailDto;
        setData(res);

        // polyline이 비정상일 때도 앱은 정상 동작해야 하니까 여기서 강제 예외는 안 던짐
        if (!res?.routePolyline) {
          // route 없으면 안내만 띄우고 끝
        }
      } catch (e) {
        console.log("❌ run record detail api error:", e);
        setErrorText("기록 상세를 불러오지 못했어요.");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [recordId]);

  const handleClose = () => navigation.goBack();

  const handleFocusRoute = () => {
    if (coords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
  };

  // RunResultScreen에서 쓰던 스타일과 최대한 비슷한 톤
  const blurredMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 1.5 }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9d1d9" }],
    },
  ];

  if (loading) {
    return (
      <View style={s.overlay}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.overlay} edges={["top", "bottom"]}>
      <View style={s.popupContainer}>
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={s.title} numberOfLines={1}>
              기록 상세보기
            </Text>
            <Text style={s.subTitle} numberOfLines={1}>
              {data?.mode === "GHOST"
                ? "고스트"
                : data?.mode === "TIER"
                ? "티어 측정"
                : "일반 측정"}
              {"  ·  "}#{data?.recordId ?? "-"}
            </Text>
          </View>

          <TouchableOpacity
            style={s.closeButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={s.mapArea}>
          {coords.length > 0 && midCoord ? (
            <View style={StyleSheet.absoluteFill}>
              <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                onMapReady={handleFocusRoute}
                customMapStyle={blurredMapStyle}
                initialRegion={{
                  latitude: midCoord.latitude,
                  longitude: midCoord.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
              >
                {/* 1) 바닥 그림자 레이어 */}
                <Polyline
                  coordinates={coords}
                  strokeColor="rgba(0,0,0,0.1)"
                  strokeWidth={16}
                />

                {/* 2) 메인 발광 레이어 */}
                <Polyline
                  coordinates={coords}
                  strokeColor="rgba(74, 110, 169, 0.4)"
                  strokeWidth={10}
                />

                {/* 3) 핵심 경로 레이어 */}
                <Polyline
                  coordinates={coords}
                  strokeColor="rgba(120, 160, 220, 0.5)"
                  strokeWidth={6}
                />

                {/* 4) 센터 하이라이트 */}
                <Polyline
                  coordinates={coords}
                  strokeColor="rgba(255, 255, 255, 0.7)"
                  strokeWidth={2}
                />

                {startCoord && (
                  <Marker coordinate={startCoord} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={s.markerCircle}>
                      <View
                        style={[s.markerInner, { backgroundColor: "#4CAF50" }]}
                      />
                    </View>
                  </Marker>
                )}

                {endCoord && (
                  <Marker coordinate={endCoord} anchor={{ x: 0.5, y: 0.5 }}>
                    <View style={s.markerCircle}>
                      <View
                        style={[s.markerInner, { backgroundColor: "#FF3B30" }]}
                      />
                    </View>
                  </Marker>
                )}
              </MapView>

              <TouchableOpacity
                style={s.focusButton}
                onPress={handleFocusRoute}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="altimeter"
                  size={22}
                  color="#4A6EA9"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.mapPlaceholder}>
              <Text style={s.mapPlaceholderText}>
                {errorText ? errorText : "경로 정보가 없거나 복원할 수 없어요."}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={s.infoContent}>
          <View style={s.grid}>
            <View style={s.card}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={22}
                color="#111827"
              />
              <Text style={s.cardLabel}>거리</Text>
              <Text style={s.cardValue}>
                {data?.distanceM != null
                  ? (data.distanceM / 1000).toFixed(2)
                  : "-"}
                <Text style={s.cardUnit}> km</Text>
              </Text>
            </View>

            <View style={s.card}>
              <Ionicons name="time-outline" size={22} color="#111827" />
              <Text style={s.cardLabel}>시간</Text>
              <Text style={s.cardValue}>{data?.timeText ?? "-"}</Text>
            </View>

            <View style={s.card}>
              <FontAwesome5 name="running" size={18} color="#111827" />
              <Text style={s.cardLabel}>페이스</Text>
              <Text style={s.cardValue}>
                {data?.paceText ?? "-"}
                <Text style={s.cardUnit}> /km</Text>
              </Text>
            </View>

            <View style={s.card}>
              <Ionicons name="flame-outline" size={22} color="#111827" />
              <Text style={s.cardLabel}>칼로리</Text>
              <Text style={s.cardValue}>
                {data?.calories ?? "-"}
                <Text style={s.cardUnit}> kcal</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.60)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  popupContainer: {
    backgroundColor: "#fff",
    width: "100%",
    height: "78%",
    borderRadius: 18,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#2B3467",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
  },
  subTitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.80)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapArea: {
    width: "100%",
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  mapPlaceholderText: {
    color: "#374151",
    fontWeight: "800",
    textAlign: "center",
  },
  focusButton: {
    position: "absolute",
    bottom: 14,
    right: 14,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 30,
    elevation: Platform.OS === "android" ? 5 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  markerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: Platform.OS === "android" ? 3 : 0,
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
  infoContent: {
    padding: 14,
    paddingBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    backgroundColor: "#F5F7FB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEF1F7",
  },
  cardLabel: {
    marginTop: 6,
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 12,
  },
  cardValue: {
    marginTop: 6,
    color: "#111827",
    fontWeight: "900",
    fontSize: 18,
  },
  cardUnit: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
  },
});
