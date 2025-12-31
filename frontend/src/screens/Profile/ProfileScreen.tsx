// ProfileScreen.tsx
import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


import BackButton from "@/components/ui/BackButton";
import { styles } from "./ProfileScreen.styles";
import { useBadge } from "@/screens/Badge/useBadge";
import { updateMyNickname } from "@/services/user/userService";

import { useGrass } from "@/screens/Profile/useGrass";
import {useMe} from "@/hooks/useMe";

export default function ProfileScreen({ navigation }: any) {
    // 로그인 유저 기준 배지 로드
    const { me, loading: meLoading, refetch  } = useMe();
    const { badges, badgeCount, loading: badgeLoading } = useBadge();
    const { data: grassData, levelMap, loading: grassLoading } = useGrass(12);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nicknameInput, setNicknameInput] = useState("");
    const [saving, setSaving] = useState(false);

    const profileImageSource =
        typeof me?.profileImageUrl === "string"
            ? { uri: me.profileImageUrl }
            : require("@/assets/images/runboo.png");
    React.useEffect(() => {
        if (me?.nickname) {
            setNicknameInput(me.nickname);
        }
    }, [me?.nickname]);
    const handleSaveNickname = async () => {
        if (!nicknameInput.trim()) return;

        try {
            setSaving(true);
            await updateMyNickname(nicknameInput.trim());
            await refetch();
            setIsEditingNickname(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ===== 헤더 ===== */}
            <View style={styles.headerContainer}>
                {/* 왼쪽 */}
                <View>
                    <BackButton />
                </View>

                {/* 가운데 */}
                <Text style={styles.headerTitle}>프로필</Text>

                {/* 오른쪽 */}
                <View>
                    <TouchableOpacity
                        style={styles.headerRightIcon}
                        onPress={() => navigation.navigate("Settings")}
                    >
                        <Ionicons name="settings-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>


            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ===== 티어 결과 버튼 ===== */}
                <TouchableOpacity
                    style={tempStyles.tierButton}
                    onPress={() =>
                        navigation.navigate("TierResult")
                    }
                >
                    <Ionicons name="analytics-outline" size={14} color="#FFF" />
                    <Text style={tempStyles.tierButtonText}>티어 결과 확인</Text>
                </TouchableOpacity>

                {/* ===== 유저 카드 ===== */}
                <View style={styles.card}>
                    <View style={styles.userHeaderRow}>
                        {meLoading ? (
                            <>
                                <View style={styles.profileImagePlaceholder}>
                                    <ActivityIndicator size="small" color="#3A4A98" />
                                </View>
                                <View style={{ width: 80, height: 18, backgroundColor: "#EEE", borderRadius: 4 }} />
                            </>
                        ) : (
                            <>
                                <View style={styles.profileImagePlaceholder}>
                                    <Image
                                        source={profileImageSource}
                                        style={styles.profileImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    {isEditingNickname ? (
                                        <>
                                            <TextInput
                                                value={nicknameInput}
                                                onChangeText={setNicknameInput}
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
                                                onPress={handleSaveNickname}
                                                disabled={saving}
                                                style={{ marginLeft: 6 }}
                                            >
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={25}
                                                    color={saving ? "#AAA" : "#3A4A98"}
                                                />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.userName}>{me?.nickname}</Text>

                                            <TouchableOpacity
                                                onPress={() => setIsEditingNickname(true)}
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
                                    styles.metricIconPlaceholder, //티어 이미지 들어가야함
                                    { backgroundColor: "#F3E5D8" },
                                ]}
                            />
                            <Text style={styles.metricLabel}>5KM</Text>
                        </View>

                        <View style={styles.metricBox}>
                            <View
                                style={[
                                    styles.metricIconPlaceholder,//티어 이미지 들어가야함
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
                        {badgeLoading ? (
                            <ActivityIndicator size="small" color="#3A4A98" />
                        ) : badges.length > 0 ? (
                            badges.map((userBadge) => (
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
                            <Text style={styles.miniStatValue}>12</Text>
                        </View>
                    </View>

                    <View style={styles.miniStatCard}>
                        <View style={styles.miniStatIconBox}>
                            <Ionicons name="ribbon" size={18} color="#000" />
                        </View>
                        <View>
                            <Text style={styles.miniStatLabel}>배지 갯수</Text>
                            <Text style={styles.miniStatValue}>{badgeCount}</Text>
                        </View>
                    </View>
                </View>

                {/* ===== 활동 잔디 ===== */}
                <View style={styles.card}>
                    <View style={headerRowStyle}>
                        <Text style={[styles.headerTitle, { fontSize: 16 }]}>활동 잔디</Text>

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
                        {grassLoading ? (
                            <ActivityIndicator size="small" color="#3A4A98" />
                        ) : grassData ? (
                            <View style={styles.grassColumns}>
                                {buildGrassColumns12Weeks(
                                    grassData.startDate,
                                    grassData.endDate
                                ).map((weekCol, weekIndex) => (
                                    <View key={`w-${weekIndex}`} style={styles.grassColumn}>
                                        {weekCol.map((dateStrOrNull, dayIndex) => {
                                            // ✅ 미래(오늘 이후)는 '칸 자체를 숨김' (테두리/배경 없음)
                                            if (!dateStrOrNull) {
                                                return (
                                                    <View
                                                        key={`future-${weekIndex}-${dayIndex}`}
                                                        style={styles.grassCellInvisible}
                                                    />
                                                );
                                            }

                                            const level = levelMap.get(dateStrOrNull) ?? 0;
                                            const bg =
                                                level === 2
                                                    ? "#3A4A98"
                                                    : level === 1
                                                        ? "#9ba4d8"
                                                        : "#efefef";

                                            return (
                                                <View
                                                    key={dateStrOrNull}
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

/* ===== 로컬 스타일 ===== */

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

/**
활동 잔디
 */
function buildGrassColumns12Weeks(startDate: string, endDate: string) {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    const columns: (string | null)[][] = [];

    for (let w = 0; w < 12; w++) {
        const col: (string | null)[] = [];
        for (let d = 0; d < 7; d++) {
            const cur = new Date(start);
            cur.setDate(start.getDate() + w * 7 + d);

            if (cur > end) col.push(null);
            else col.push(cur.toISOString().slice(0, 10));
        }
        columns.push(col);
    }

    return columns;
}
