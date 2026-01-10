import { StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
        },
        container: {
            flex: 1,
        },
        /* ================= 헤더 ================= */
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
            paddingHorizontal: 16,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "800",
            color: Colors[scheme].text,
        },
        icon: {
            fontSize: 24,
            color: Colors[scheme].text,
        },
        /* ================= 스크롤 컨텐츠 ================= */
        scrollContent: {
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 40,
        },
        /* ================= 안내 박스 (NoticeBox) ================= */
        noticeBox: {
            flexDirection: "row",
            backgroundColor: Colors[scheme].card,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: Colors[scheme].secondaryBackground,
        },
        noticeTextWrapper: {
            marginLeft: 12,
            flex: 1,
        },
        noticeTitle: {
            fontSize: 15,
            fontWeight: "700",
            color: Colors[scheme].text,
            marginBottom: 2,
        },
        noticeDesc: {
            fontSize: 13,
            color: Colors[scheme].icon,
            lineHeight: 18,
        },
        /* ================= 폼 영역 ================= */
        label: {
            fontSize: 14,
            fontWeight: "700",
            color: Colors[scheme].text,
            marginBottom: 8,
            marginLeft: 4,
        },
        input: {
            borderWidth: 1,
            borderColor: Colors[scheme].secondaryBackground,
            borderRadius: 12,
            padding: 14,
            fontSize: 16,
            color: Colors[scheme].text,
            backgroundColor: Colors[scheme].card,
            marginBottom: 20,
        },
        /* ================= 하단 버튼 ================= */
        submitButton: {
            backgroundColor: Colors[scheme].primary,
            paddingVertical: 16,
            marginHorizontal: 20,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: Platform.OS === "ios" ? 10 : 20,
        },
        disabledButton: {
            opacity: 0.5,
        },
        submitText: {
            color: "#FFF",
            fontSize: 16,
            fontWeight: "700",
        },
        /* 보조 버튼 (재전송 등) */
        secondaryButton: {
            alignItems: "center",
            marginTop: -8,
            marginBottom: 20,
        },
        secondaryButtonText: {
            color: Colors[scheme].primary,
            fontWeight: "600",
            fontSize: 14,
        },
    });