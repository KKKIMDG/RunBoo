import React, { useRef, useState, useEffect, useMemo } from "react";
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
  currentDistance?: number;
  currentPace?: string;
}

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

  // ✅ [수정] 스타일 동적 생성 (다크모드 완벽 대응)
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

  const isFocused = useIsFocused();
  const { nearbyRunners } = useNearbyRunners(isFocused);
  const { me } = useMe();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState<RunnerProfile | null>(null);

  const [bestStats, setBestStats] = useState<{
    distance: string;
    pace: string;
    time: string;
  } | null>(null);

  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (selectedRunner) {
      setIsStatsLoading(true);
      setBestStats(null);

      console.log(`🔎 ${selectedRunner.nickname}(ID:${selectedRunner.userId})의 최고 기록 조회 중...`);

      fetchTargetUserBestGhost(selectedRunner.userId)
          .then((ghost) => {
            if (ghost) {
              const totalSeconds = Math.round(ghost.targetDistanceKm * ghost.avgPace);

              setBestStats({
                distance: ghost.targetDistanceKm.toFixed(2),
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
            setIsStatsLoading(false);
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

  const handleStartGhostRun = async () => {
    if (!selectedRunner) return;
    if (!me?.userId) {
      Alert.alert("알림", "사용자 정보를 불러오는 중입니다.");
      return;
    }

    setIsLoading(true);

    try {
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
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

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
            // ✅ [선택] 다크모드일 때 지도 스타일도 어둡게 하려면 여기에 customMapStyle 추가 필요
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
                style={styles.roundButton}
                onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.roundButton}
                onPress={handleMoveToCurrentLocation}
            >
              <MaterialIcons name="my-location" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {selectedRunner && (
            <View style={styles.runnerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.profileRow}>
                  {selectedRunner.profileImageUrl ? (
                      <Image
                          source={{ uri: selectedRunner.profileImageUrl }}
                          style={styles.cardProfileImage}
                      />
                  ) : (
                      <View style={styles.cardPlaceholderImage}>
                        <Ionicons name="person" size={30} color="#ccc" />
                      </View>
                  )}
                  <View style={styles.textInfo}>
                    <Text style={styles.nickname}>
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

              <View style={styles.statsContainer}>
                {isStatsLoading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="small" color={colors.text} />
                    </View>
                ) : bestStats ? (
                    <>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>최고 거리</Text>
                        <Text style={styles.statValue}>
                          {bestStats.distance} km
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>최고 페이스</Text>
                        <Text style={styles.statValue}>
                          {bestStats.pace}
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>예상 시간</Text>
                        <Text style={styles.statValue}>
                          {bestStats.time}
                        </Text>
                      </View>
                    </>
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={styles.emptyText}>
                        아직 최고 기록이 없는 러너예요 🏃
                      </Text>
                    </View>
                )}
              </View>

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

// ✅ 스타일 생성 함수 (여기에 모든 테마 로직 집중)
const getStyles = (scheme: "light" | "dark") => {
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  return StyleSheet.create({
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
      backgroundColor: colors.card, // ✅ 카드 색상
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
      backgroundColor: colors.card, // ✅ 카드 배경
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
    cardPlaceholderImage: {
      width: 56,
      height: 56,
      borderRadius: 20,
      marginRight: 14,
      backgroundColor: isDark ? '#444' : '#eee', // ✅ 플레이스홀더 배경
      justifyContent: "center",
      alignItems: "center",
    },
    textInfo: {
      justifyContent: "center",
    },
    nickname: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
      color: colors.text, // ✅ 텍스트 색상
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#4ade80' : 'black', // ✅ 상태 점 (다크모드에선 밝은 초록)
      marginRight: 6,
    },
    statusText: {
      fontSize: 13,
      color: colors.icon, // ✅ 아이콘/보조 텍스트 색상
    },
    closeBtn: {
      padding: 8,
      backgroundColor: isDark ? '#333' : '#f2f2f2', // ✅ 닫기 버튼 배경
      borderRadius: 20,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      minHeight: 72,
    },
    statBox: {
      flex: 1,
      backgroundColor: isDark ? '#333' : '#F5F6F8', // ✅ 통계 박스 배경 (중요!)
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
      marginHorizontal: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.icon,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text, // ✅ 값 텍스트 색상
    },
    emptyText: {
      color: colors.icon,
      fontSize: 14
    },
    ghostButton: {
      backgroundColor: isDark ? '#444' : 'black', // ✅ 버튼 배경
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 16,
      borderRadius: 20,
    },
    ghostButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: "bold",
    },
  });
};