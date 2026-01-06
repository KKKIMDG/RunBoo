// src/screens/Notification/useNotifications.ts
import { useEffect, useState } from "react";
import {
    getNotifications,
    getUnreadNotifications,
    readNotification,
    readAllNotifications,
} from "@/services/notification/notificationService";
import type { NotificationItem } from "@/types/notification";

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"ALL" | "UNREAD">("ALL");

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

    /** 단건 읽음 */
    const markAsRead = async (id: number) => {
        // 🔥 UI 즉시 반영
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );

        await readNotification(id);
    };

    /** 전체 읽음 */
    const markAllAsRead = async () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );

        await readAllNotifications();
    };

    return {
        notifications,
        loading,
        tab,
        setTab,
        markAsRead,
        markAllAsRead,
    };
}
