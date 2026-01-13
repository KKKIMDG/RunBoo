import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
            paddingHorizontal: 20,
        },

        header: {
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },

        headerTitle: {
            fontSize: scaleFont(17, fontSize),
            fontWeight: "bold",
            color: Colors[scheme].text,
        },

        icon: {
            fontSize: scaleFont(22, fontSize),
            color: Colors[scheme].icon,
        },

        scrollContent: {
            paddingBottom: 24,
        },

        /* =========================
           탈퇴 경고 박스 (Destructive)
           ========================= */
        noticeBox: {
            flexDirection: "row",
            backgroundColor: Colors[scheme].destructiveBox,
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
        },

        noticeIcon: {
            fontSize: scaleFont(18, fontSize),
            color: Colors[scheme].error, // 아이콘은 강하게
        },

        noticeTextWrapper: {
            marginLeft: 10,
            flex: 1,
        },

        noticeTitle: {
            fontSize: scaleFont(13, fontSize),
            fontWeight: "600",
            color: Colors[scheme].destructiveTitle,
            marginBottom: 4,
        },

        noticeDesc: {
            fontSize: scaleFont(12, fontSize),
            color: Colors[scheme].destructiveText,
            lineHeight: 18,
        },

        form: {
            flex: 1,
        },

        label: {
            fontSize: scaleFont(13, fontSize),
            fontWeight: "600",
            color: Colors[scheme].text,
            marginBottom: 6,
            marginTop: 12,
        },

        inputWrapper: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors[scheme].background,
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 48,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },

        input: {
            flex: 1,
            fontSize: scaleFont(14, fontSize),
            color: Colors[scheme].text,
        },

        /* =========================
           탈퇴 버튼
           ========================= */
        withdrawButton: {
            height: 56,
            borderRadius: 16,
            backgroundColor: Colors[scheme].error,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 28,
        },

        withdrawButtonDisabled: {
            backgroundColor: Colors[scheme].disabled,
        },

        withdrawButtonText: {
            fontSize: scaleFont(16, fontSize),
            fontWeight: "600",
            color: Colors[scheme].white,
        },
    });
