import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Text,
  Platform,
  GestureResponderEvent,
  Alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNearbyRunners } from "@/hooks/useNearbyRunners";

interface RunnerProfile {
  userId: number;
  nickname: string;
  latitude: number;
  longitude: number;
  profileImageUrl?: string;
  currentDistance?: number;
  currentPace?: string;
  runningTime?: string;
}

export default function MapFullScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { location } = route.params || {};

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isFocused = useIsFocused();
  const { nearbyRunners } = useNearbyRunners(isFocused);

  const [selectedRunner, setSelectedRunner] = useState<RunnerProfile | null>(
    null
  );

  const handleMapPress = () => {
    setSelectedRunner(null);
  };

  const mapRef = useRef<MapView>(null);

  const handleMoveToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          zoom: 16,
          pitch: 0,
          heading: 0,
        },
        { duration: 500 }
      );
    } else {
      Alert.alert("알림", "현재 위치를 불러올 수 없습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 37.5665,
          longitude: location?.coords.longitude || 126.978,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {nearbyRunners.map((runner) => (
          <Marker
            key={runner.userId}
            coordinate={{
              latitude: runner.latitude,
              longitude: runner.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedRunner(runner);
            }}
          >
            <View style={styles.markerContainer}>
              {runner.profileImageUrl ? (
                <Image
                  source={{ uri: runner.profileImageUrl }}
                  style={styles.markerImage}
                />
              ) : (
                <Ionicons name="person" size={24} color="#4A90E2" />
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* 🔝 상단 버튼 영역 */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.headerRow}>
          {/* 뒤로가기 */}
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* 현재 위치 버튼 (우측 상단) */}
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: colors.card }]}
            onPress={handleMoveToCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ✅ [추가] 러너 프로필 카드 (selectedRunner가 있을 때만 표시) */}
      {selectedRunner && (
        <View style={[styles.runnerCard, { backgroundColor: colors.card }]}>
          {/* 상단: 프로필 이미지, 닉네임, 닫기 버튼 */}
          <View style={styles.cardHeader}>
            <View style={styles.profileRow}>
              {selectedRunner.profileImageUrl ? (
                <Image
                  source={{ uri: selectedRunner.profileImageUrl }}
                  style={styles.cardProfileImage}
                />
              ) : (
                <View
                  style={[
                    styles.cardProfileImage,
                    {
                      backgroundColor: "#eee",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Ionicons name="person" size={30} color="#ccc" />
                </View>
              )}
              <View style={styles.textInfo}>
                <Text style={[styles.nickname, { color: colors.text }]}>
                  {selectedRunner.nickname}
                </Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>접속중</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedRunner(null)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* 중단: 통계 정보 (거리, 페이스, 시간) */}
          {/* ⚠️ 실제 데이터가 없다면 임시 값을 넣어주거나 백엔드 연동 필요 */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {selectedRunner.currentDistance ?? "3.8"} km
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>페이스</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {selectedRunner.currentPace ?? "4'45\""}/km
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>시간</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {selectedRunner.runningTime ?? "18:03"}
              </Text>
            </View>
          </View>

          {/* 하단: 고스트 버튼 */}
          <TouchableOpacity style={styles.ghostButton}>
            <Ionicons
              name="flash"
              size={18}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.ghostButtonText}>고스트 가져오기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },

  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A90E2",
  },

  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // ✅ [추가] 러너 카드 스타일
  runnerCard: {
    position: "absolute",
    bottom: 40, // 하단에서 40 띄움
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardProfileImage: {
    width: 56,
    height: 56,
    borderRadius: 20, // 둥근 사각형 느낌
    marginRight: 14,
  },
  textInfo: {
    justifyContent: "center",
  },
  nickname: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "black",
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: "#666",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F5F6F8", // 연한 회색 배경
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4, // 박스 간격
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  ghostButton: {
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
  },
  ghostButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
