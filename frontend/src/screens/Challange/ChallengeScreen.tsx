// src/screens/Challange/ChallengeScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStyles } from "./Challenge.styles";
import { useChallenge, Challenge } from "./useChallenge";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TIER_IMAGES } from "@/constants/TierImages";
import BackButton from "@/components/ui/BackButton";
import { useNavigation } from "@react-navigation/native";

// ChallengeScreen.tsx 상단 (import문 아래)
const getLevelStyle = (level: string) => {
  switch (level) {
    case "초급":
      return { backgroundColor: "#5C7CFA" };
    case "중급":
      return { backgroundColor: "#343A40" }; // 사진처럼 검정색 계열
    case "고급":
      return { backgroundColor: "#4C6EF5" };
    default:
      return { backgroundColor: "#868E96" };
  }
};

const ChallengeScreen = ({ navigation: defaultNavigation }: any) => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme() ?? "light";
  const styles = getStyles(colorScheme);
  const { challenges, loading } = useChallenge(navigation);
  const [activeStatus, setActiveStatus] = useState<"진행 중" | "완료">(
    "진행 중"
  );

  const renderCompletedItem = ({ item }: { item: Challenge }) => (
    <View style={styles.completedCard}>
      <View style={styles.badgeIconBox}>
        {/* API 연동 필요: 챌린지별 뱃지 이미지 또는 아이콘 (현재 고정 아이콘) */}
        <Ionicons name="medal" size={32} color="#3A4A98" />
      </View>
      <View style={styles.cardInfo}>
        {/* API 연동 필요: 챌린지 제목 (item.title) */}
        <Text style={styles.cardTitle}>{item.title} 완료</Text>
        {/* API 연동 필요: 실제 완료 날짜 데이터 (현재 고정 텍스트) */}
        <Text style={styles.cardDate}>완료: 2024.11.20</Text>
        {/* API 연동 필요: 획득한 보상 명칭 (item.reward) */}
        <Text style={styles.cardReward}>배지</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#3A4A98" />
    </View>
  );

  // 진행 중 아이템 렌더링
  const renderProgressItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCard}>
      {/* 상단: 타이틀 및 난이도 뱃지 */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          {/* API 연동 필요: 도전과제 이름 (item.title) */}
          <Text style={styles.challengeTitle}>{item.title}</Text>

          {/* API 연동 필요: 난이도 (item.level - 초급/중급/고급) */}
          <View style={[styles.levelBadge, getLevelStyle(item.level)]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <Ionicons name="time-outline" size={20} color="#666" />
      </View>

      {/* API 연동 필요: 도전과제 부가 설명 (item.description) */}
      <Text style={styles.challengeDescription}>{item.description}</Text>

      {/* 중간: 진행도 바 섹션 */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>진행도</Text>
          {/* API 연동 필요: 현재 진행 값 / 목표 값 (item.current / item.total) */}
          <Text style={styles.progressValue}>
            {item.current} / {item.total}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          {/* API 연동 필요: 진행 비율 계산 (item.current / item.total * 100) */}
          <View
            style={[
              styles.progressBarFill,
              { width: `${(item.current / item.total) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* 하단: 추가 정보 블록 */}
      <View style={styles.infoBlockContainer}>
        {/* 남은 시간 블록 */}
        <View style={styles.infoBlock}>
          <Ionicons
            name="time-outline"
            size={16}
            color="#000"
            style={styles.infoIcon}
          />
          <View>
            <Text style={styles.infoLabel}>남은 시간</Text>
            {/* API 연동 필요: 마감 기한까지 남은 일수 (item.remainingDays) */}
            <Text style={styles.infoValue}>{item.remainingDays}일</Text>
          </View>
        </View>

        {/* 보상 블록 */}
        <View style={styles.infoBlock}>
          {/* API 연동 필요: 보상 종류에 따른 아이콘 변경 로직 필요할 수 있음 */}
          <Ionicons
            name="medal-outline"
            size={16}
            color="#000"
            style={styles.infoIcon}
          />
          <View>
            <Text style={styles.infoLabel}>보상</Text>
            {/* API 연동 필요: 달성 시 보상 내용 (item.reward) */}
            <Text style={styles.infoValue}>{item.reward}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 1. 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>도전과제</Text>
          <Text style={styles.headerSubtitle}>
            목표를 달성하고 보상을 받으세요
          </Text>
        </View>

        {/* 2. 탭 버튼 */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeStatus === "진행 중" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveStatus("진행 중")}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={activeStatus === "진행 중" ? "#FFF" : "#868E96"}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeStatus === "진행 중" && styles.tabButtonTextActive,
              ]}
            >
              진행 중
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeStatus === "완료" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveStatus("완료")}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={activeStatus === "완료" ? "#FFF" : "#868E96"}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeStatus === "완료" && styles.tabButtonTextActive,
              ]}
            >
              완료
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. 도전과제 리스트 */}
        {loading ? (
          <ActivityIndicator size="large" color="#3A4A98" />
        ) : (
          <FlatList
            // API 연동 확인: useChallenge 훅에서 가져온 challenges 배열이 아래 필터 로직에 맞게 들어와야 함
            data={challenges.filter((c) =>
              activeStatus === "완료" ? c.isCompleted : !c.isCompleted
            )}
            renderItem={
              activeStatus === "완료" ? renderCompletedItem : renderProgressItem
            }
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 100 },
            ]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            ListHeaderComponent={
              activeStatus === "완료" ? (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Ionicons name="trophy-outline" size={24} color="#000" />
                    <Text style={styles.summaryHeaderText}>달성 현황</Text>
                  </View>
                  <View style={styles.summaryValueContainer}>
                    {/* API 연동 필요: 총 완료한 도전과제 개수 (서버에서 length를 받아오거나 카운트 필요) */}
                    <Text style={styles.summaryValue}>12</Text>
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
