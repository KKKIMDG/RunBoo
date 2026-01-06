// src/screens/Notification/useNotificationScreen.ts
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import {
    getNotifications,
    getUnreadNotifications,
    readNotification,
    readAllNotifications,
} from "@/services/notification/notificationService";

import type { NotificationItem } from "@/types/notification";

export function useNotificationScreen() {
    const navigation = useNavigation<any>();

    /** UI 상태 */
    const [tab, setTab] = useState<"ALL" | "UNREAD">("ALL");
    const [loading, setLoading] = useState(true);

    /** 알림 데이터 */
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    /** 조회 */
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data =
                tab === "ALL"
                    ? await getNotifications()
                    : await getUnreadNotifications();

            setNotifications(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [tab]);

    /** 미읽음 개수 */
    const unreadCount = notifications.filter(n => !n.read).length;

    /** 단건 읽음 + 이동 */
    const onPressNotification = async (item: NotificationItem) => {
        if (!item.read) {
            // UI 즉시 반영
            setNotifications(prev =>
                prev.map(n =>
                    n.id === item.id ? { ...n, read: true } : n
                )
            );

            // 서버 반영
            await readNotification(item.id);
        }

        const parent = navigation.getParent(); //BottomTabNavigator
        if (!parent) return;

        // 타입별 이동
        switch (item.type) {
            case "RUN_RESULT":
                navigation.navigate("MainTabs", { screen: "Record" });
                break;

            case "CHALLENGE":
                navigation.navigate("MainTabs", { screen: "Challenge" });
                break;

            case "REMINDER":
                navigation.navigate("MainTabs", { screen: "Home" });
                break;

            case "EVENT":
                navigation.navigate("MainTabs", { screen: "Course" });
                break;
        }
    };

    /** 전체 읽음 */
    const markAllAsRead = async () => {
        // UI 즉시 반영
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );

        await readAllNotifications();
    };


    return {
        // state
        notifications,
        loading,
        tab,
        unreadCount,

        // actions
        setTab,
        onPressNotification,
        markAllAsRead,
        reload: fetchNotifications,
    };
}
