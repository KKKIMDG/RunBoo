import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "@/components/ui/BackButton";
import { getStyles } from "./ProfileScreen.styles";
import { useProfile } from "./useProfile";
import { TIER_ID_MAP } from "@/constants/TierImages";
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

export default function ProfileScreen({ navigation }: any) {
  const profile = useProfile(12);

  /** 일반 설정 */
  const { settings } = useSettings();
  const colorScheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  /** Pull-to-Refresh 상태 */
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await profile.refetchAll();
    setRefreshing(false);
  }, [profile]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ===== 헤더 ===== */}
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity
          style={styles.headerRightIcon}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3A4A98"
            colors={["#3A4A98"]}
          />
        }
      >
        {/* ===== 유저 카드 ===== */}
        <View style={styles.card}>
          <View style={styles.userHeaderRow}>
            {profile.meLoading ? (
              <ActivityIndicator size="small" color="#3A4A98" />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.profileImagePlaceholder}
                  onPress={profile.changeProfileImage}
                  disabled={profile.saving}
                >
                  <Image
                    source={profile.profileImageSource}
                    style={styles.profileImage}
                    resizeMode="contain"
                  />
                  {profile.imageLoading && (
                    <View style={styles.profileImageOverlay}>
                      <ActivityIndicator color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {profile.isEditingNickname ? (
                    <>
                      <TextInput
                        value={profile.nicknameInput}
                        onChangeText={profile.setNicknameInput}
                        style={[
                          styles.userName,
                          {
                            borderBottomWidth: 1,
                            borderColor: "#DDD",
                            paddingVertical: 2,
                            minWidth: 80,
                          },
                        ]}
                        maxLength={12}
                        autoFocus
                      />
                      <TouchableOpacity
                        onPress={profile.saveNickname}
                        disabled={profile.saving}
                        style={{ marginLeft: 6 }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={25}
                          color={profile.saving ? "#AAA" : "#3A4A98"}
                        />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.userName}>
                        {profile.userMe?.nickname}
                      </Text>
                      <TouchableOpacity
                        onPress={() => profile.setIsEditingNickname(true)}
                        style={{ marginLeft: 6 }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={25}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </View>

          {/* ===== 주요 지표 ===== */}
          <View style={styles.metricsRow}>
            {/* 5KM 티어 */}
            <View style={styles.metricBox}>
              {profile.tierLoading ? (
                <ActivityIndicator size="small" />
              ) : profile.tier5kId && TIER_ID_MAP[profile.tier5kId] ? (
                <Image
                  source={TIER_ID_MAP[profile.tier5kId]}
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="footsteps-outline" size={32} color="#DDD" />
              )}
              <Text style={[styles.metricLabel, { marginTop: 4 }]}>5KM</Text>
            </View>

            {/* 10KM 티어 */}
            <View style={styles.metricBox}>
              {profile.tierLoading ? (
                <ActivityIndicator size="small" />
              ) : profile.tier10kId && TIER_ID_MAP[profile.tier10kId] ? (
                <Image
                  source={TIER_ID_MAP[profile.tier10kId]}
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="footsteps-outline" size={32} color="#DDD" />
              )}
              <Text style={[styles.metricLabel, { marginTop: 4 }]}>10KM</Text>
            </View>

            {/* 총 거리 데이터 반영 */}
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>
                {profile.totalDistanceLoading
                  ? "-"
                  : (profile.totalDistanceM / 1000).toFixed(1)}
              </Text>
              <Text style={styles.metricSubLabel}>총 KM</Text>
            </View>
          </View>

          {/* ===== 배지 섹션 ===== */}
          <View style={styles.badgeSectionHeader}>
            <Text style={styles.badgeSectionTitle}>획득한 배지</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("BadgeCollection")}
              activeOpacity={0.7}
            >
              <Ionicons
                style={styles.icon}
                name="arrow-forward-circle-outline"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeList}
          >
            {profile.badgeLoading ? (
              <ActivityIndicator size="small" color="#3A4A98" />
            ) : profile.badges.length > 0 ? (
              profile.badges.map((userBadge) => {
                // iconUrl이 없는 경우 필터링
                if (!userBadge?.iconUrl) {
                  return null;
                }
                return (
                  <View
                    key={userBadge.userBadgeId}
                    style={styles.badgeIconPlaceholder}
                  >
                    <Image
                      source={{ uri: userBadge.iconUrl }}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </View>
                );
              })
            ) : (
              <Text style={{ color: "#999", fontSize: 12 }}>
                획득한 배지가 없습니다.
              </Text>
            )}
          </ScrollView>
        </View>

        {/* ===== 요약 통계 (연속 일수 & 배지 갯수) ===== */}
        <View style={styles.statsSummaryRow}>
          <View style={styles.miniStatCard}>
            <View style={styles.miniStatIconBox}>
              <Ionicons name="flame" size={18} color="#3A4A98" />
            </View>
            <View>
              <Text style={styles.miniStatLabel}>연속 일수</Text>
              <Text style={styles.miniStatValue}>
                {profile.streakLoading ? "-" : (profile.streak ?? "0")}
              </Text>
            </View>
          </View>

          <View style={styles.miniStatCard}>
            <View style={styles.miniStatIconBox}>
              <Ionicons name="ribbon" style={styles.icon} />
            </View>
            <View>
              <Text style={styles.miniStatLabel}>배지 갯수</Text>
              <Text style={styles.miniStatValue}>{profile.badgeCount}</Text>
            </View>
          </View>
        </View>

        {/* ===== 활동 잔디 ===== */}
        <View style={styles.card}>
          <View style={styles.grassTitleRow}>
            <Text style={styles.grassTitle}>활동 잔디</Text>

            {/* 오른쪽 범례 (dev 브례 합침) */}
            <View style={styles.grassLegend}>
              <View style={styles.grassLegendItem}>
                <View
                  style={[
                    styles.grassLegendDot,
                    { backgroundColor: "#efefef" },
                  ]}
                />
                <Text style={styles.grassLegendText}>없음</Text>
              </View>

              <View style={styles.grassLegendItem}>
                <View
                  style={[
                    styles.grassLegendDot,
                    { backgroundColor: "#9ba4d8" },
                  ]}
                />
                <Text style={styles.grassLegendText}>5km미만</Text>
              </View>

              <View style={styles.grassLegendItem}>
                <View
                  style={[
                    styles.grassLegendDot,
                    { backgroundColor: "#3A4A98" },
                  ]}
                />
                <Text style={styles.grassLegendText}>5km이상</Text>
              </View>
            </View>
          </View>

          <View style={styles.grassGrid}>
            {profile.grassLoading ? (
              <ActivityIndicator size="small" color="#3A4A98" />
            ) : profile.grassData ? (
              <View style={styles.grassColumns}>
                {profile
                  .buildGrassColumns12Weeks(
                    profile.grassData.startDate,
                    profile.grassData.endDate,
                  )
                  .map((weekCol, weekIndex) => (
                    <View key={`w-${weekIndex}`} style={styles.grassColumn}>
                      {weekCol.map((date, dayIndex) => {
                        if (!date) {
                          return (
                            <View
                              key={`empty-${weekIndex}-${dayIndex}`}
                              style={styles.grassCellInvisible}
                            />
                          );
                        }
                        const level = profile.levelMap.get(date) ?? 0;
                        const bg =
                          level === 2
                            ? "#3A4A98"
                            : level === 1
                              ? "#9ba4d8"
                              : "#efefef";
                        return (
                          <View
                            key={date}
                            style={[styles.grassCell, { backgroundColor: bg }]}
                          />
                        );
                      })}
                    </View>
                  ))}
              </View>
            ) : (
              <Text style={{ color: "#999", fontSize: 12 }}>
                잔디 데이터를 불러오지 못했습니다.
              </Text>
            )}
          </View>

          <View style={styles.grassFooter}>
            <Text style={styles.grassFooterText}>12주 전</Text>
            <Text style={styles.grassFooterText}>이번 주</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
