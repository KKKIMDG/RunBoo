// screens/Profile/ProfileScreen.tsx
import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "@/components/ui/BackButton";
import { styles } from "./ProfileScreen.styles";
import { useProfile } from "./useProfile";

export default function ProfileScreen({ navigation }: any) {
    const profile = useProfile(12);

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
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ===== 티어 결과 버튼 ===== */}
                <TouchableOpacity
                    style={styles.tierButton}
                    onPress={() => navigation.navigate("TierResult")}
                >
                    <Ionicons name="analytics-outline" size={14} color="#FFF" />
                    <Text style={styles.tierButtonText}>티어 결과 확인</Text>
                </TouchableOpacity>

                {/* ===== 유저 카드 ===== */}
                <View style={styles.card}>
                    <View style={styles.userHeaderRow}>
                        {profile.meLoading ? (
                            <>
                                <View style={styles.profileImagePlaceholder}>
                                    <ActivityIndicator size="small" color="#3A4A98" />
                                </View>
                                <View
                                    style={{
                                        width: 80,
                                        height: 18,
                                        backgroundColor: "#EEE",
                                        borderRadius: 4,
                                    }}
                                />
                            </>
                        ) : (
                            <>
                                {/* 프로필 이미지 */}
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

                                {/* 닉네임 */}
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
                                                onPress={() =>
                                                    profile.setIsEditingNickname(true)
                                                }
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
                            <Text style={styles.metricValue}>임시데이터</Text>
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
                                name="arrow-forward-circle-outline"
                                size={24}
                                color="#000"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.badgeList}>
                        {profile.badgeLoading ? (
                            <ActivityIndicator size="small" color="#3A4A98" />
                        ) : profile.badges.length > 0 ? (
                            profile.badges.map((userBadge) => (
                                <View
                                    key={userBadge.userBadgeId}
                                    style={styles.badgeIconPlaceholder}
                                >
                                    <Image
                                        source={{ uri: userBadge.badge.iconUrl }}
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

                {/* ===== 요약 통계 ===== */}
                <View style={styles.statsSummaryRow}>
                    <View style={styles.miniStatCard}>
                        <View style={styles.miniStatIconBox}>
                            <Ionicons name="flame" size={18} color="#3A4A98" />
                        </View>
                        <View>
                            <Text style={styles.miniStatLabel}>연속 일수</Text>
                            <Text style={styles.miniStatValue}>
                                {profile.streakLoading
                                    ? "-"
                                    : profile.streak ?? "-"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.miniStatCard}>
                        <View style={styles.miniStatIconBox}>
                            <Ionicons name="ribbon" size={18} color="#000" />
                        </View>
                        <View>
                            <Text style={styles.miniStatLabel}>배지 갯수</Text>
                            <Text style={styles.miniStatValue}>
                                {profile.badgeCount}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ===== 활동 잔디 ===== */}
                <View style={styles.card}>
                    <View style={styles.grassTitleRow}>
                        <Text style={styles.grassTitle}>활동 잔디</Text>

                        {/* 오른쪽 범례(이미지처럼) */}
                        <View style={styles.grassLegend}>
                            <View style={styles.grassLegendItem}>
                                <View style={[styles.grassLegendDot, { backgroundColor: "#efefef" }]} />
                                <Text style={styles.grassLegendText}>없음</Text>
                            </View>

                            <View style={styles.grassLegendItem}>
                                <View style={[styles.grassLegendDot, { backgroundColor: "#9ba4d8" }]} />
                                <Text style={styles.grassLegendText}>5km미만</Text>
                            </View>

                            <View style={styles.grassLegendItem}>
                                <View style={[styles.grassLegendDot, { backgroundColor: "#3A4A98" }]} />
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
                                        profile.grassData.endDate
                                    )
                                    .map((weekCol, weekIndex) => (
                                        <View
                                            key={`w-${weekIndex}`}
                                            style={styles.grassColumn}
                                        >
                                            {weekCol.map((date, dayIndex) => {
                                                if (!date) {
                                                    return (
                                                        <View
                                                            key={`empty-${weekIndex}-${dayIndex}`}
                                                            style={
                                                                styles.grassCellInvisible
                                                            }
                                                        />
                                                    );
                                                }

                                                const level =
                                                    profile.levelMap.get(date) ?? 0;
                                                const bg =
                                                    level === 2
                                                        ? "#3A4A98"
                                                        : level === 1
                                                            ? "#9ba4d8"
                                                            : "#efefef";

                                                return (
                                                    <View
                                                        key={date}
                                                        style={[
                                                            styles.grassCell,
                                                            { backgroundColor: bg },
                                                        ]}
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
