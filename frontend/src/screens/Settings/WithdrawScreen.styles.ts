import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 20,
    },

    header: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    headerTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: "#111827",
    },

    scrollContent: {
      paddingBottom: 24,
    },

    noticeBox: {
      flexDirection: "row",
      backgroundColor: "#FEF2F2", // 탈퇴용 경고 톤
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
    },

    noticeTextWrapper: {
      marginLeft: 10,
      flex: 1,
    },

    noticeTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: "#DC2626",
      marginBottom: 4,
    },

    noticeDesc: {
      fontSize: 12,
      color: "#7F1D1D",
      lineHeight: 18,
    },

    form: {
      flex: 1,
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: "#111827",
      marginBottom: 6,
      marginTop: 12,
    },

    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF",
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },

    input: {
      flex: 1,
      fontSize: 14,
      color: "#111827",
    },

    withdrawButton: {
      height: 56,
      borderRadius: 16,
      backgroundColor: "#DC2626", // 빨강 계열
      justifyContent: "center",
      alignItems: "center",
      marginTop: 28,
    },

    withdrawButtonDisabled: {
      backgroundColor: "#FCA5A5",
    },

    withdrawButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    cancelText: {
      marginTop: 18,
      textAlign: "center",
      fontSize: 13,
      color: "#6B7280",
      textDecorationLine: "underline",
    },
  });
