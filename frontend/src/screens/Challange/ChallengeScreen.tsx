import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "./Challenge.styles";
import { useChallenge, Challenge } from "./useChallenge";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";

// 난이도별 스타일 정의
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
  const colorScheme = useColorScheme() ?? "light";
  const styles = getStyles(colorScheme);

  // ✅ 훅에서 필요한 상태와 함수를 가져옵니다.
  const { challenges, loading, status, toggleStatus } =
    useChallenge(navigation);

  // 완료 아이템 렌더링
  const renderCompletedItem = ({ item }: { item: Challenge }) => (
    <View style={styles.completedCard}>
      <View style={styles.badgeIconBox}>
        <Ionicons name="medal" size={32} color="#3A4A98" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {/* 훅에서 완료 날짜 포맷팅 로직이 추가되면 더 정확해집니다. 현재는 고정 텍스트 유지 혹은 단순 표시 */}
        <Text style={styles.cardDate}>챌린지 달성 완료</Text>
        <Text style={styles.cardReward}>획득 배지: {item.reward}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#3A4A98" />
    </View>
  );

  // 진행 중 아이템 렌더링
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
          {/* ✅ 훅에서 계산된 item.percent를 그대로 사용합니다. */}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>도전과제</Text>
          <Text style={styles.headerSubtitle}>
            목표를 달성하고 보상을 받으세요
          </Text>
        </View>

        {/* 탭 버튼: status 상태에 따라 활성화 */}
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
            // ✅ 훅에서 이미 status에 맞춰 필터링된 데이터를 가져오므로 추가 필터링이 필요 없습니다.
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
            ListHeaderComponent={
              status === "COMPLETED" ? (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="trophy-outline" size={24} color="#000" />
                    <Text style={styles.summaryHeaderText}>달성 현황</Text>
                  </View>
                  <View style={styles.summaryValueContainer}>
                    {/* ✅ 완료된 챌린지 개수를 실시간으로 표시합니다. */}
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
