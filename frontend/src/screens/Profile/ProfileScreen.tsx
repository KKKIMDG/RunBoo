import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./ProfileScreen.styles";
import BackButton from "@/components/ui/BackButton";
import { useProfile } from "./useProfile"; // ✅ useProfile 훅 임포트

// 활동 잔디를 위한 더미 데이터 (추후 API 연동 가능)
const GRASS_DATA = Array.from({ length: 7 }, () =>
  Array.from({ length: 12 }, () => Math.floor(Math.random() * 3))
);

export default function ProfileScreen({ navigation }: any) {
  // ✅ 유저 ID 1로 데이터 로드
  const { badges, badgeCount, loading } = useProfile(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 영역 */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity
          style={styles.headerRightIcon}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 티어 결과 확인 버튼 */}
        <TouchableOpacity
          style={tempStyles.tierButton}
          onPress={() => {
            navigation.navigate("TierResult", {
              recordId: 1,
              distanceType: "5k",
            });
          }}
        >
          <Ionicons name="analytics-outline" size={14} color="#FFF" />
          <Text style={tempStyles.tierButtonText}>
            티어 결과 확인 (recordId: 1)
          </Text>
        </TouchableOpacity>

        {/* 유저 정보 카드 */}
        <View style={styles.card}>
          <View style={styles.userHeaderRow}>
            <View style={styles.profileImagePlaceholder}>
              <Image
                source={require("@/assets/images/runboo.png")}
                style={{ width: 45, height: 45 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.userName}>러너</Text>
          </View>

          {/* 주요 지표 */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <View
                style={[
                  styles.metricIconPlaceholder,
                  { backgroundColor: "#F3E5D8" },
                ]}
              />
              <Text style={styles.metricLabel}>5KM</Text>
            </View>
            <View style={styles.metricBox}>
              <View
                style={[
                  styles.metricIconPlaceholder,
                  { backgroundColor: "#B3E5FC" },
                ]}
              />
              <Text style={styles.metricLabel}>10KM</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>342</Text>
              <Text style={styles.metricSubLabel}>총 KM</Text>
            </View>
          </View>

          {/* ✅ 배지 섹션: 실데이터 연동 */}
          <View style={styles.badgeSectionHeader}>
            <Text style={styles.badgeSectionTitle}>획득한 배지</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("BadgeCollection")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-forward-circle-outline"
                size={24}
                color="#000000"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.badgeList}>
            {loading ? (
              <ActivityIndicator size="small" color="#3A4A98" />
            ) : badges.length > 0 ? (
              // 서버에서 받아온 배지 목록을 가로로 나열
              badges.map((badge) => (
                <View key={badge.badgeId} style={styles.badgeIconPlaceholder}>
                  <Image
                    source={{ uri: badge.iconUrl }}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                  />
                </View>
              ))
            ) : (
              <Text style={{ color: "#999", fontSize: 12 }}>
                획득한 배지가 없습니다.
              </Text>
            )}
          </View>
        </View>

        {/* 요약 통계: 실데이터 연동 */}
        <View style={styles.statsSummaryRow}>
          <View style={styles.miniStatCard}>
            <View style={styles.miniStatIconBox}>
              <Ionicons name="flame" size={18} color="#3A4A98" />
            </View>
            <View>
              <Text style={styles.miniStatLabel}>연속 일수</Text>
              <Text style={styles.miniStatValue}>12</Text>
            </View>
          </View>
          <View style={styles.miniStatCard}>
            <View style={styles.miniStatIconBox}>
              <Ionicons name="ribbon" size={18} color="#000" />
            </View>
            <View>
              <Text style={styles.miniStatLabel}>배지 갯수</Text>
              {/* ✅ 하드코딩 13을 badgeCount로 교체 */}
              <Text style={styles.miniStatValue}>{badgeCount}</Text>
            </View>
          </View>
        </View>

        {/* 활동 잔디 섹션 */}
        <View style={styles.card}>
          <View style={headerRowStyle}>
            <Text style={[styles.headerTitle, { fontSize: 16 }]}>
              활동 잔디
            </Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: "#F1F3F5" }]}
                />
                <Text style={styles.legendText}>없음</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendBox,
                    { backgroundColor: "rgba(58, 74, 152, 0.3)" },
                  ]}
                />
                <Text style={styles.legendText}>5km미만</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendBox, { backgroundColor: "#3A4A98" }]}
                />
                <Text style={styles.legendText}>5km이상</Text>
              </View>
            </View>
          </View>

          <View style={styles.grassGrid}>
            {GRASS_DATA.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.grassRow}>
                {row.map((cell, cellIndex) => (
                  <View
                    key={`cell-${cellIndex}`}
                    style={[
                      styles.grassCell,
                      {
                        backgroundColor:
                          cell === 2
                            ? "#3A4A98"
                            : cell === 1
                            ? "rgba(58, 74, 152, 0.3)"
                            : "#F1F3F5",
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={styles.grassFooter}>
            <Text style={styles.grassFooterText}>3개월 전</Text>
            <Text style={styles.grassFooterText}>오늘</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일 보정용
const headerRowStyle = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: 12,
};

const tempStyles = StyleSheet.create({
  tierButton: {
    backgroundColor: "#6366F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  tierButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
});
