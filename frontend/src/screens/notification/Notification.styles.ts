// src/screens/Notification/Notification.styles.ts
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
        },

        /* ================= 헤더 ================= */
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 60,
            paddingHorizontal: 20,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: Colors[scheme].text,
        },
        backButton: {
            position: "absolute",
            left: 15,
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
        },

        /* ================= 전환 영역 ================= */
        switchSection: {
            paddingHorizontal: 20,
        },

        tabSwitcher: {
            flexDirection: "row",
            backgroundColor: Colors[scheme].card,
            borderRadius: 20,
            padding: 6,
            borderWidth: 1,
            borderColor: Colors[scheme].secondaryBackground,
        },

        tabButton: {
            flex: 1,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            flexDirection: "row",
            gap: 6,
        },
        tabButtonActive: {
            backgroundColor: Colors[scheme].primary,
        },
        tabText: {
            fontSize: 14,
            fontWeight: "600",
            color: Colors[scheme].icon,
        },
        tabTextActive: {
            color: "#FFF",
        },

        badge: {
            backgroundColor: "#FF4D4F",
            borderRadius: 10,
            paddingHorizontal: 6,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
        },
        badgeText: {
            fontSize: 11,
            fontWeight: "700",
            color: "#FFF",
        },

        dividerStandalone: {
            height: 1,
            backgroundColor: '#F1F3F5',
            marginHorizontal: -20,
            marginTop: 12,
        },

        readAllRow: {
            alignItems: 'flex-end',
            paddingTop: 6,
        },
        readAllText: {
            fontSize: 14,
            fontWeight: "700",
            color: "#212529",
            paddingVertical: 8,
        },
        readAllTextDisabled: {
            color: '#ADB5BD',      // 회색
        },

        /* ================= 리스트 ================= */
        listContent: {
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 40,
        },

        card: {
            flexDirection: "row",
            backgroundColor: Colors[scheme].card,
            borderRadius: 20,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors[scheme].secondaryBackground,
            opacity: 0.6,
        },
        cardUnread: {
            borderLeftWidth: 4,
            borderLeftColor: Colors[scheme].primary,
            opacity: 1,
        },
        iconBox: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "rgba(58,74,152,0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        cardContent: {
            flex: 1,
        },
        cardTitle: {
            fontSize: 15,
            fontWeight: "700",
            color: Colors[scheme].text,
            marginBottom: 4,
        },
        cardMessage: {
            fontSize: 13,
            color: Colors[scheme].icon,
            marginBottom: 6,
        },
        cardDate: {
            fontSize: 11,
            color: Colors[scheme].icon,
        },

        emptyContainer: {
            marginTop: 100,
            alignItems: "center",
        },
        emptyTitle: {
            marginTop: 12,
            fontSize: 16,
            fontWeight: "700",
            color: Colors[scheme].text,
        },
        emptyDesc: {
            marginTop: 6,
            fontSize: 13,
            color: Colors[scheme].icon,
        },
        icon:{
            color: Colors[scheme].icon,
            fontSize: 22,
        }
    });
