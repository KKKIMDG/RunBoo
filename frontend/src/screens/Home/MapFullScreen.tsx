import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Text,
  Platform,
  Alert,
  ActivityIndicator,
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
import { useMe } from "@/hooks/useMe";

// ✅ 서비스 함수 Import
import { fetchTargetUserBestGhost } from "@/services/ghost/ghostService";

interface RunnerProfile {
  userId: number;
  nickname: string;
  latitude: number;
  longitude: number;
  profileImageUrl?: string;
  // 실시간 정보가 없을 수도 있으므로 optional
  currentDistance?: number;
  currentPace?: string;
}

// ⏱️ 시간/페이스 포맷팅 함수
const formatPace = (seconds: number) => {
  if (!seconds) return "-'--\"";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}'${s < 10 ? "0" : ""}${s}"`;
};

const formatTime = (totalSeconds: number) => {
  if (!totalSeconds) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function MapFullScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { location } = route.params || {};

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isFocused = useIsFocused();
  const { nearbyRunners } = useNearbyRunners(isFocused);
  const { me } = useMe();

  const [isLoading, setIsLoading] = useState(false); // 고스트런 시작 버튼 로딩
  const [selectedRunner, setSelectedRunner] = useState<RunnerProfile | null>(null);

  // ✅ [추가] 선택된 유저의 최고 기록을 담을 State
  const [bestStats, setBestStats] = useState<{
    distance: string;
    pace: string;
    time: string;
  } | null>(null);

  // ✅ [추가] 통계 로딩 상태 (카드 내부용)
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const mapRef = useRef<MapView>(null);

  // 🚀 [로직 추가] 러너를 선택하면 서버에서 최고 기록 조회
  useEffect(() => {
    if (selectedRunner) {
      setIsStatsLoading(true); // 로딩 시작
      setBestStats(null); // 기존 데이터 초기화

      console.log(`🔎 ${selectedRunner.nickname}(ID:${selectedRunner.userId})의 최고 기록 조회 중...`);

      fetchTargetUserBestGhost(selectedRunner.userId)
          .then((ghost) => {
            if (ghost) {
              console.log("✅ 최고 기록 수신 완료:", ghost);
              // 시간 계산 (거리 km * 페이스 s/km = 총 초)
              const totalSeconds = Math.round(ghost.targetDistanceKm * ghost.avgPace);

              setBestStats({
                distance: ghost.targetDistanceKm.toFixed(2), // 소수점 2자리
                pace: formatPace(ghost.avgPace),
                time: formatTime(totalSeconds),
              });
            } else {
              console.log("⚠️ 최고 기록 없음 (신규 유저)");
            }
          })
          .catch((err) => {
            console.error("❌ 최고 기록 조회 실패:", err);
          })
          .finally(() => {
            setIsStatsLoading(false); // 로딩 끝
          });
    }
  }, [selectedRunner]);

  const handleMapPress = () => {
    setSelectedRunner(null);
  };

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

  // 고스트런 시작 핸들러
  const handleStartGhostRun = async () => {
    if (!selectedRunner) return;
    if (!me?.userId) {
      Alert.alert("알림", "사용자 정보를 불러오는 중입니다.");
      return;
    }

    setIsLoading(true);

    try {
      // (이미 useEffect에서 가져왔지만, 확실하게 하기 위해 한 번 더 호출하거나 bestStats를 재활용 가능)
      // 여기서는 안전하게 다시 호출합니다.
      const targetGhost = await fetchTargetUserBestGhost(selectedRunner.userId);

      if (targetGhost) {
        navigation.navigate("GhostRun", {
          ghost: targetGhost,
          userId: me.userId,
        });
      } else {
        Alert.alert(
            "기록 없음",
            `${selectedRunner.nickname}님은 아직 달리기 기록이 없어요!`
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "고스트 정보를 가져오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
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

        <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
          <View style={styles.headerRow}>
            <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: colors.card }]}
                onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: colors.card }]}
                onPress={handleMoveToCurrentLocation}
            >
              <MaterialIcons name="my-location" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* ✅ 러너 프로필 카드 */}
        {selectedRunner && (
            <View style={[styles.runnerCard, { backgroundColor: colors.card }]}>
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

              {/* ✅ [수정됨] 통계 정보 표시 (로딩/데이터/없음 분기 처리) */}
              <View style={styles.statsContainer}>
                {isStatsLoading ? (
                    // 1. 로딩 중: 뺑뺑이 표시
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="small" color={colors.text} />
                    </View>
                ) : bestStats ? (
                    // 2. 데이터 있음: 최고 기록 표시
                    <>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>최고 거리</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {bestStats.distance} km
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>최고 페이스</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {bestStats.pace}
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>예상 시간</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {bestStats.time}
                        </Text>
                      </View>
                    </>
                ) : (
                    // 3. 데이터 없음: 안내 문구
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#999', fontSize: 14 }}>
                        아직 최고 기록이 없는 러너예요 🏃
                      </Text>
                    </View>
                )}
              </View>

              {/* 고스트 가져오기 버튼 */}
              <TouchableOpacity
                  style={[
                    styles.ghostButton,
                    isLoading && { backgroundColor: "#555" }
                  ]}
                  onPress={handleStartGhostRun}
                  disabled={isLoading}
              >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                      <Ionicons
                          name="flash"
                          size={18}
                          color="white"
                          style={{ marginRight: 8 }}
                      />
                      <Text style={styles.ghostButtonText}>
                        {selectedRunner.nickname}의 고스트 가져오기
                      </Text>
                    </>
                )}
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
  runnerCard: {
    position: "absolute",
    bottom: 40,
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
    borderRadius: 20,
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
    minHeight: 72, // 로딩바나 텍스트가 떴을 때 높이 확보
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
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