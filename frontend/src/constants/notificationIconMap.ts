import { Ionicons } from "@expo/vector-icons";
import type { NotificationType } from "@/types/notification";

export const NotificationIconMap: Record<
    NotificationType,
    keyof typeof Ionicons.glyphMap
> = {
    RUN_RESULT: "trophy",
    CHALLENGE: "medal",
    REMINDER: "alarm",
    EVENT: "notifications",
};
