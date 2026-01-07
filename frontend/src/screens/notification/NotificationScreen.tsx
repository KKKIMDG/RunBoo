import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getStyles } from "./Notification.styles";
import { useNotificationScreen } from "./useNotificationScreen";
import type { NotificationItem } from "@/types/notification";
import { formatRelativeTime } from "@/utils/time";
import {useNavigation} from "@react-navigation/native";
import { NotificationIconMap } from "@/constants/notificationIconMap";

const NotificationScreen = () => {
    const scheme = useColorScheme() ?? "light";
    const styles = getStyles(scheme);
    const navigation = useNavigation<any>();

    const {
        notifications,
        loading,
        tab,
        setTab,
        unreadCount,
        onPressNotification,
        markAllAsRead,
    } = useNotificationScreen();

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressNotification(item)}
        >
            <View
                style={[
                    styles.card,
                    !item.read && styles.cardUnread,
                ]}
            >
                <View style={styles.iconBox}>
                    <Ionicons
                        name={NotificationIconMap[item.type]}
                        size={22}
                        color="#3A4A98"
                    />
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMessage}>{item.body}</Text>
                    <Text style={styles.cardDate}>
                        {formatRelativeTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
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
                                <Text style={styles.badgeText}>
                                    {unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerStandalone} />

                <View style={styles.readAllRow}>
                    <TouchableOpacity
                        onPress={unreadCount === 0 ? undefined : markAllAsRead}
                        disabled={unreadCount === 0}
                        activeOpacity={unreadCount === 0 ? 1 : 0.7}
                    >
                        <Text style={[styles.readAllText,
                            unreadCount === 0 && styles.readAllTextDisabled,
                        ]}>모두 읽음</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ================= 리스트 ================= */}
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color="#3A4A98"
                    style={{ marginTop: 20 }}
                />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </SafeAreaView>
    );
};

export default NotificationScreen;
