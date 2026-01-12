// src/hooks/useUnreadNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { getUnreadCount } from "@/services/notification/notificationService";

export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const isFocused = useIsFocused();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread notification count:", error);
      // In case of error, maybe we should not show the dot.
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    // Fetch count when the screen is focused
    if (isFocused) {
      fetchUnreadCount();
    }
  }, [isFocused, fetchUnreadCount]);

  // Optional: Add polling if real-time updates are desired without websockets
  useEffect(() => {
    const interval = setInterval(() => {
        if(isFocused) {
            fetchUnreadCount();
        }
    }, 30000); // 30초마다 다시 가져오기

    return () => clearInterval(interval);
  }, [fetchUnreadCount, isFocused]);


  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    refetch: fetchUnreadCount,
  };
};
