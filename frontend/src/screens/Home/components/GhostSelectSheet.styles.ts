import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";

export const getStyles = (scheme: "light" | "dark", fontSize: FontSizeSetting) =>
    StyleSheet.create({
        backdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
            paddingHorizontal: 16,
        },
        backdropTouch: {
            ...StyleSheet.absoluteFillObject,
        },
        sheet: {
            backgroundColor: Colors[scheme].background,
            borderRadius: 18,
            overflow: "hidden",
            maxHeight: "70%",
        },
        header: {
            backgroundColor: Colors[scheme].primary,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        headerTitle: {
            color: "#fff",
            fontSize: scaleFont(16, fontSize),
            fontWeight: "800",
        },

        tabRow: {
            flexDirection: "row",
            padding: 14,
        },
        tabPill: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 999,
            marginRight: 8,
        },
        tabPillActive: {
            backgroundColor: Colors[scheme].primary,
        },
        tabText: {
            fontSize: scaleFont(13, fontSize),
            marginLeft: 5,
            fontWeight: "700",
            color: Colors[scheme].text,
        },
        tabTextActive: {
            color: "#fff",
        },

        loadingBox: {
            padding: 20,
        },
        listContent: {
            paddingBottom: 12,
        },

        item: {
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            marginHorizontal: 14,
            marginTop: 10,
            borderWidth: 1,
            borderRadius: 14,
            borderColor: Colors[scheme].border,
            backgroundColor: Colors[scheme].card,
        },
        iconColor: {
            color: Colors[scheme].primary,
        },
        itemLeft: {
            flex: 1,
            marginLeft: 12,
        },
        itemRight: {
            alignItems: "flex-end",
        },
        itemTitle: {
            fontSize: scaleFont(14, fontSize),
            fontWeight: "800",
            color: Colors[scheme].text,
        },
        itemSub: {
            fontSize: 12,
            color: Colors[scheme].muted,
            marginTop: 4,
        },

        // ===== 친구 탭 전용 =====
        friendAvatar: {
            width: 34,
            height: 34,
            borderRadius: 999,
            backgroundColor: Colors[scheme].border,
        },
        friendAvatarFallback: {
            width: 34,
            height: 34,
            borderRadius: 999,
            backgroundColor: Colors[scheme].border,
            alignItems: "center",
            justifyContent: "center",
        },
        friendAvatarIcon: {
            color: Colors[scheme].muted,
        },

        emptyBox: {
            paddingVertical: 26,
            paddingHorizontal: 20,
            alignItems: "center",
        },
        emptyText: {
            marginTop: 10,
            fontSize: scaleFont(14, fontSize),
            fontWeight: "800",
            color: Colors[scheme].text,
        },
        emptySubText: {
            marginTop: 6,
            fontSize: 12,
            color: Colors[scheme].muted,
        },
    });
