import React, {useMemo} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "./Challenge.styles";
import { useChallenge, Challenge } from "./useChallenge";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {useSettings} from "@/screens/Settings/useSettings";

const getLevelStyle = (level: string) => {
  switch (level) {
    case "초급":
      return { backgroundColor: "#5C7CFA" };
    case "중급":
      return { backgroundColor: "#343A40" };
    case "고급":
      return { backgroundColor: "#4C6EF5" };
    default:
      return { backgroundColor: "#868E96" };
  }
};

const ChallengeScreen = () => {
  const navigation = useNavigation<any>();
    const { settings } = useSettings();
    const colorScheme = useColorScheme() ?? "light";
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

  const { challenges, loading, status, toggleStatus } =
    useChallenge(navigation);

  const renderCompletedItem = ({ item }: { item: Challenge }) => (
    <View style={styles.completedCard}>
      <View style={styles.badgeIconBox}>
        <Ionicons name="medal" size={32} color="#3A4A98" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>챌린지 달성 완료</Text>
        <Text style={styles.cardReward}>획득 배지: {item.reward}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#3A4A98" />
    </View>
  );

  const renderProgressItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <View style={[styles.levelBadge, getLevelStyle(item.level)]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <Ionicons name="time-outline" size={20} color="#666" />
      </View>

      <Text style={styles.challengeDescription}>{item.description}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>진행도</Text>
          <Text style={styles.progressValue}>
            {item.current} / {item.total}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${item.percent}%` }]}
          />
        </View>
      </View>

      <View style={styles.infoBlockContainer}>
        <View style={styles.infoBlock}>
          <Ionicons
            name="time-outline"
            size={16}
            color="#000"
            style={styles.infoIcon}
          />
          <View>
            <Text style={styles.infoLabel}>남은 시간</Text>
            <Text style={styles.infoValue}>{item.remainingDays}일</Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Ionicons
            name="medal-outline"
            size={16}
            color="#000"
            style={styles.infoIcon}
          />
          <View>
            <Text style={styles.infoLabel}>보상</Text>
            <Text style={styles.infoValue}>{item.reward}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ✅ 데이터가 없을 때 보여줄 컴포넌트 추가
  const renderEmptyComponent = () => (
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
          color: "#333",
          marginBottom: 8,
        }}
      >
        {status === "IN_PROGRESS"
          ? "모든 과제를 완료하였습니다!"
          : "아직 완료한 과제가 없습니다."}
      </Text>
      <Text style={{ fontSize: 14, color: "#868E96" }}>
        {status === "IN_PROGRESS"
          ? "새로운 도전을 기다려주세요."
          : "도전과제를 수행하고 배지를 획득하세요."}
      </Text>
    </View>
  );

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
            onPress={() => toggleStatus("IN_PROGRESS")}
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
            onPress={() => toggleStatus("COMPLETED")}
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

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3A4A98"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={challenges}
            renderItem={
              status === "COMPLETED" ? renderCompletedItem : renderProgressItem
            }
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 100 },
            ]}
            showsVerticalScrollIndicator={false}
            // ✅ 빈 화면 처리 추가
            ListEmptyComponent={renderEmptyComponent}
            ListHeaderComponent={
              status === "COMPLETED" && challenges.length > 0 ? (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="trophy-outline" size={24} color="#000" />
                    <Text style={styles.summaryHeaderText}>달성 현황</Text>
                  </View>
                  <View style={styles.summaryValueContainer}>
                    <Text style={styles.summaryValue}>{challenges.length}</Text>
                    <Text style={styles.summaryLabel}>완료</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChallengeScreen;
