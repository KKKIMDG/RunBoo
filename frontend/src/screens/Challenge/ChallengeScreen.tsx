import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  ToastAndroid,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "./Challenge.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  initializeChallenges,
  getActiveChallenges,
  getCompletedChallenges,
} from "@/services/challenge/ChallengeService";
import type { UserChallengeDto } from "@/types/challenge";

const ChallengeScreen = () => {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const colorScheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  const [status, setStatus] = useState<"IN_PROGRESS" | "COMPLETED">(
    "IN_PROGRESS",
  );
  const [showInitModal, setShowInitModal] = useState(false); // 초기화 모달 상태
  const [isInitialized, setIsInitialized] = useState(false); // 챌린지 초기화 여부
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [challenges, setChallenges] = useState<UserChallengeDto[]>([]); // 챌린지 데이터
  const [completedChallenges, setCompletedChallenges] = useState<
    UserChallengeDto[]
  >([]); // 완료된 챌린지
  const [dataLoading, setDataLoading] = useState(true); // 데이터 로딩 상태
  const [refreshing, setRefreshing] = useState(false); // Pull to Refresh 상태

  // 화면에 포커스될 때마다 초기화 여부 체크
  useFocusEffect(
    useCallback(() => {
      const checkAndLoadChallenges = async () => {
        try {
          setDataLoading(true);

          // 활성 챌린지 조회 (진행 중 1개 + 다음 2개 = 총 3개)
          const data = await getActiveChallenges();

          if (data && data.length > 0) {
            // 챌린지 데이터가 있으면 초기화된 상태
            console.log(`✅ 챌린지 ${data.length}개 조회 성공:`);
            console.log(JSON.stringify(data, null, 2));

            // 진행도 상세 로그
            data.forEach((challenge, index) => {
              console.log(`[챌린지 ${index + 1}] ${challenge.title}`);
              console.log(`  - 상태: ${challenge.status}`);
              console.log(
                `  - 진행도: ${challenge.progressValue}/${challenge.targetValue}`,
              );
              console.log(
                `  - 진행률: ${((challenge.progressValue / challenge.targetValue) * 100).toFixed(1)}%`,
              );
              console.log(`  - 레벨: ${challenge.level}`);
            });

            setChallenges(data);
            setIsInitialized(true);
            setShowInitModal(false);

            // 완료된 챌린지도 함께 조회
            const completedData = await getCompletedChallenges();
            console.log(`✅ 완료된 챌린지 ${completedData.length}개 조회`);
            console.log("📋 완료된 챌린지 상세 데이터:");
            console.log(JSON.stringify(completedData, null, 2));
            if (completedData.length > 0) {
              completedData.forEach((challenge, index) => {
                console.log(`[완료 ${index + 1}] ${challenge.title}`);
                console.log(`  - badgeId: ${challenge.badgeId}`);
                console.log(`  - badgeName: ${challenge.badgeName}`);
                console.log(`  - badgeIconUrl: ${challenge.badgeIconUrl}`);
                console.log(
                  `  - badgeName type: ${typeof challenge.badgeName}`,
                );
                console.log(
                  `  - badgeName null? ${challenge.badgeName === null}`,
                );
                console.log(
                  `  - badgeName undefined? ${challenge.badgeName === undefined}`,
                );
                console.log(
                  `  - badgeName empty? ${challenge.badgeName === ""}`,
                );
              });
            }
            setCompletedChallenges(completedData);
          } else {
            // 챌린지 데이터가 없으면 초기화 필요
            console.log("챌린지 데이터 없음 - 초기화 필요");
            setChallenges([]);
            setCompletedChallenges([]);
            setIsInitialized(false);
            setShowInitModal(true);
          }
        } catch (error: any) {
          console.error("챌린지 조회 실패:", error);

          // 404 에러면 초기화가 필요한 상태
          if (error?.status === 404 || error?.response?.status === 404) {
            setChallenges([]);
            setCompletedChallenges([]);
            setIsInitialized(false);
            setShowInitModal(true);
          } else {
            // 그 외 에러는 토스트로 알림
            const errorMessage = "챌린지 조회에 실패했습니다.";
            if (Platform.OS === "android") {
              ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            } else {
              Alert.alert("오류", errorMessage);
            }
          }
        } finally {
          setDataLoading(false);
        }
      };

      checkAndLoadChallenges();
    }, []),
  );

  // 챌린지 수락 핸들러
  const handleAccept = async () => {
    setLoading(true);
    try {
      // TODO: 실제 시즌 ID를 가져오는 로직 필요 (현재는 임시로 1 사용)
      const seasonId = 1;

      await initializeChallenges(seasonId);

      // 초기화 후 활성 챌린지 조회 (진행 중 1개 + 다음 2개)
      const data = await getActiveChallenges();
      console.log(`✅ 초기화 후 챌린지 ${data.length}개 조회:`);
      console.log(JSON.stringify(data, null, 2));
      setChallenges(data);

      setShowInitModal(false);
      setIsInitialized(true);

      // 성공 메시지
      const message = "챌린지가 시작되었습니다!";
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert("성공", message);
      }
    } catch (error) {
      console.error("챌린지 초기화 실패:", error);

      const errorMessage = "챌린지 시작에 실패했습니다. 다시 시도해주세요.";
      if (Platform.OS === "android") {
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      } else {
        Alert.alert("오류", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // 챌린지 거부 핸들러
  const handleReject = () => {
    setShowInitModal(false);

    // 토스트 메시지 표시
    const message = "거부 시 도전 기능을 이용할 수 없습니다.";
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("알림", message);
    }

    navigation.goBack(); // 홈 화면으로 이동
  };

  // Pull to Refresh 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (status === "IN_PROGRESS") {
        console.log("🔄 진행 중 챌린지 새로고침...");
        const data = await getActiveChallenges();
        console.log(`✅ 새로고침: ${data.length}개 챌린지 조회`);
        data.forEach((challenge, index) => {
          console.log(
            `[${index + 1}] ${challenge.title}: ${challenge.progressValue}/${challenge.targetValue} (${challenge.status})`,
          );
        });
        setChallenges(data);
      } else {
        console.log("🔄 완료된 챌린지 새로고침...");
        const completedData = await getCompletedChallenges();
        console.log(
          `✅ 새로고침: ${completedData.length}개 완료된 챌린지 조회`,
        );
        setCompletedChallenges(completedData);
      }
    } catch (error) {
      console.error("❌ 새로고침 실패:", error);
    } finally {
      setRefreshing(false);
    }
  }, [status]);

  // 완료된 챌린지 카드 렌더링
  const renderCompletedCard = ({ item }: { item: UserChallengeDto }) => {
    return (
      <View style={styles.completedCard}>
        {item.badgeIconUrl ? (
          <Image
            source={{ uri: item.badgeIconUrl }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              marginRight: 15,
            }}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.badgeIconBox}>
            <Ionicons name="medal" size={32} color="#3A4A98" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title || "챌린지"}</Text>
          <Text style={styles.cardDate}>
            완료:{" "}
            {item.completedAt
              ? new Date(item.completedAt).toLocaleDateString("ko-KR")
              : "-"}
          </Text>
          <Text style={styles.cardReward}>
            보상: {item.badgeName || "보상 없음"}
          </Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color="#3A4A98" />
      </View>
    );
  };

  // 챌린지 카드 렌더링
  const renderChallengeCard = ({ item }: { item: UserChallengeDto }) => {
    const isLocked = item.status === "LOCKED";
    const isInProgress = item.status === "IN_PROGRESS";
    const progress = item.progressValue || 0;
    const target = item.targetValue || 0;
    const percentage =
      target > 0 ? Math.min((progress / target) * 100, 100) : 0;

    // LOCKED 상태 카드
    if (isLocked) {
      return (
        <View
          style={[
            styles.challengeCard,
            {
              backgroundColor: colorScheme === "dark" ? "#2C2C2E" : "#F3F4F6",
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.challengeTitle, { color: "#868E96" }]}>
                {item.title || "챌린지"}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: "#868E96" }]}>
                <Text style={styles.levelText}>Lv.{item.level || "?"}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.challengeDescription, { color: "#ADB5BD" }]}>
            {item.description || "목표를 달성하세요"}
          </Text>

          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 30,
            }}
          >
            <Ionicons name="lock-closed" size={48} color="#ADB5BD" />
            <Text
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "#868E96",
                fontWeight: "600",
              }}
            >
              이전 레벨 클리어시 오픈
            </Text>
          </View>
        </View>
      );
    }

    // IN_PROGRESS 상태 카드
    return (
      <View style={styles.challengeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.challengeTitle}>{item.title || "챌린지"}</Text>
            <View style={[styles.levelBadge, { backgroundColor: "#3A4A98" }]}>
              <Text style={styles.levelText}>Lv.{item.level || "1"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.challengeDescription}>
          {item.description || "목표를 달성하세요"}
        </Text>

        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={styles.progressLabel}>진행도</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colorScheme === "dark" ? "#FFF" : "#000",
              }}
            >
              {progress} / {target}
            </Text>
          </View>

          {/* 진행 게이지 바 */}
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${percentage}%` }]}
            />
          </View>
        </View>

        <View style={styles.infoBlockContainer}>
          <View style={styles.infoBlock}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colorScheme === "dark" ? "#FFF" : "#000"}
              style={styles.infoIcon}
            />
            <View>
              <Text style={styles.infoLabel}>타입</Text>
              <Text style={styles.infoValue}>{item.targetType || "목표"}</Text>
            </View>
          </View>

          <View style={styles.infoBlock}>
            {item.badgeName ? (
              item.badgeIconUrl ? (
                <Image
                  source={{ uri: item.badgeIconUrl }}
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 10,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="trophy-outline"
                  size={16}
                  color={colorScheme === "dark" ? "#FFF" : "#000"}
                  style={styles.infoIcon}
                />
              )
            ) : (
              <Ionicons
                name="close-circle-outline"
                size={16}
                color="#868E96"
                style={styles.infoIcon}
              />
            )}
            <View>
              <Text style={styles.infoLabel}>보상</Text>
              <Text style={styles.infoValue}>
                {item.badgeName || "보상 없음"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>도전과제</Text>
          <Text style={styles.headerSubtitle}>
            목표를 달성하고 보상을 받으세요
          </Text>
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              status === "IN_PROGRESS" && styles.tabButtonActive,
            ]}
            onPress={() => setStatus("IN_PROGRESS")}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={status === "IN_PROGRESS" ? "#FFF" : "#868E96"}
            />
            <Text
              style={[
                styles.tabButtonText,
                status === "IN_PROGRESS" && styles.tabButtonTextActive,
              ]}
            >
              진행 중
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              status === "COMPLETED" && styles.tabButtonActive,
            ]}
            onPress={() => setStatus("COMPLETED")}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={status === "COMPLETED" ? "#FFF" : "#868E96"}
            />
            <Text
              style={[
                styles.tabButtonText,
                status === "COMPLETED" && styles.tabButtonTextActive,
              ]}
            >
              완료
            </Text>
          </TouchableOpacity>
        </View>

        {dataLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 100,
            }}
          >
            <ActivityIndicator size="large" color="#3A4A98" />
          </View>
        ) : status === "COMPLETED" ? (
          // 완료 탭
          completedChallenges.length > 0 ? (
            <FlatList
              data={completedChallenges}
              renderItem={renderCompletedCard}
              keyExtractor={(item) => String(item.userChallengeId)}
              ListHeaderComponent={
                <View style={styles.summaryCard}>
                  <View style={styles.summaryValueContainer}>
                    <Text style={styles.summaryValue}>
                      {completedChallenges.length}
                    </Text>
                    <Text style={styles.summaryLabel}>달성한 도전과제</Text>
                  </View>
                </View>
              }
              contentContainerStyle={[
                styles.listContainer,
                { paddingBottom: 100 },
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={"#3A4A98"}
                  colors={["#3A4A98"]}
                />
              }
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 100,
              }}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={48}
                color="#868E96"
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colorScheme === "dark" ? "#FFF" : "#333",
                  marginBottom: 8,
                }}
              >
                완료한 도전과제가 없습니다
              </Text>
              <Text style={{ fontSize: 14, color: "#868E96" }}>
                도전과제를 완료하고 배지를 획득하세요
              </Text>
            </View>
          )
        ) : // 진행 중 탭
        challenges.length > 0 ? (
          <FlatList
            data={challenges}
            renderItem={renderChallengeCard}
            keyExtractor={(item) => String(item.userChallengeId)}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 100 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={"#3A4A98"}
                colors={["#3A4A98"]}
              />
            }
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 100,
            }}
          >
            <Ionicons
              name="sparkles-outline"
              size={48}
              color="#3A4A98"
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colorScheme === "dark" ? "#FFF" : "#333",
                marginBottom: 8,
              }}
            >
              도전과제를 시작해보세요
            </Text>
            <Text style={{ fontSize: 14, color: "#868E96" }}>
              목표를 달성하고 보상을 받으세요
            </Text>
          </View>
        )}
      </View>

      {/* 초기화 확인 모달 */}
      <Modal
        visible={showInitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>도전과제</Text>
            <Text style={styles.modalMessage}>
              목표를 달성하고 보상을 받으세요
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAccept]}
                onPress={handleAccept}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonTextAccept,
                    ]}
                  >
                    수락
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonReject]}
                onPress={handleReject}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextReject]}
                >
                  거부
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChallengeScreen;
