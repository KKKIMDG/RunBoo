// src/screens/Notification/NotificationScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getStyles } from "./Notification.styles";

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    type: "RECORD" | "CHALLENGE" | "SOCIAL";
};

const MOCK_DATA: NotificationItem[] = [
    {
        id: "1",
        title: "새로운 기록 달성! 🏆",
        message: "5km를 28분 만에 주파했어요! 개인 최고 기록입니다.",
        createdAt: "5분 전",
        isRead: false,
        type: "RECORD",
    },
    {
        id: "2",
        title: "스피드러너님이 함께 달리기를 제안했어요",
        message: "내일 오전 7시에 함께 달려볼까요?",
        createdAt: "15분 전",
        isRead: false,
        type: "SOCIAL",
    },
    {
        id: "3",
        title: "챌린지 달성 🎉",
        message: "첫 러닝 챌린지를 완료했어요!",
        createdAt: "1시간 전",
        isRead: true,
        type: "CHALLENGE",
    },
];

const NotificationScreen = () => {
    const navigation = useNavigation<any>();
    const scheme = useColorScheme() ?? "light";
    const styles = getStyles(scheme);

    const [tab, setTab] = useState<"ALL" | "UNREAD">("ALL");
    const [loading] = useState(false);

    const unreadCount = MOCK_DATA.filter((n) => !n.isRead).length;

    const filteredData =
        tab === "ALL"
            ? MOCK_DATA
            : MOCK_DATA.filter((item) => !item.isRead);

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <View style={[styles.card, !item.isRead && styles.cardUnread]}>
            <View style={styles.iconBox}>
                <Ionicons
                    name={
                        item.type === "RECORD"
                            ? "trophy"
                            : item.type === "CHALLENGE"
                                ? "medal"
                                : "walk"
                    }
                    size={22}
                    color="#3A4A98"
                />
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardDate}>{item.createdAt}</Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#ADB5BD"
            />
            <Text style={styles.emptyTitle}>알림이 없습니다</Text>
            <Text style={styles.emptyDesc}>
                새로운 소식이 오면 알려드릴게요.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* ================= 헤더 ================= */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>알림</Text>
            </View>

            {/* ================= 전환 영역 ================= */}
            <View style={styles.switchSection}>
                {/* 탭 */}
                <View style={styles.tabSwitcher}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            tab === "ALL" && styles.tabButtonActive,
                        ]}
                        onPress={() => setTab("ALL")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                tab === "ALL" && styles.tabTextActive,
                            ]}
                        >
                            전체
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            tab === "UNREAD" && styles.tabButtonActive,
                        ]}
                        onPress={() => setTab("UNREAD")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                tab === "UNREAD" && styles.tabTextActive,
                            ]}
                        >
                            읽지 않음
                        </Text>

                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* 구분선 */}
                <View style={styles.dividerStandalone} />

                {/* 모두 읽음 */}
                <View style={styles.readAllRow}>
                    <TouchableOpacity>
                        <Text style={styles.readAllText}>모두 읽음</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ================= 리스트 ================= */}
            <ScrollView>
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#3A4A98"
                    style={{ marginTop: 20 }}
                />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                />
            )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationScreen;
