import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
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
      fontSize: 17,
      fontWeight: "bold",
      color: Colors[scheme].text,
    },

    noticeBox: {
      flexDirection: "row",
      backgroundColor: Colors[scheme].warningBox,
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
      color: Colors[scheme].warningTitle,
      marginBottom: 4,
    },

    noticeDesc: {
      fontSize: 12,
      color: Colors[scheme].warningText,
      lineHeight: 18,
    },

    form: {
      flex: 1,
    },

    label: {
      fontSize: 13,
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
      fontSize: 14,
      color: Colors[scheme].text,
    },
    scrollContent: {
      paddingBottom: 24,
    },

    submitButton: {
      height: 52,
      borderRadius: 16,
      backgroundColor: Colors[scheme].primary,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 20,
      marginBottom: 16,
    },

    disabledButton: {
      backgroundColor: Colors[scheme].disabled,
    },

    submitText: {
      color: Colors[scheme].text,
      fontSize: 15,
      fontWeight: "600",
    },
    emailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },

    emailText: {
      marginLeft: 8,
      fontSize: 16, // 존재감 있음
      fontWeight: "600",
      color: Colors[scheme].text,
    },
    confirmButton: {
      flexDirection: "row",
      height: 56,
      borderRadius: 16,
      backgroundColor: Colors[scheme].primary, // 메인 액션 컬러
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },

    confirmButtonDisabled: {
      backgroundColor: Colors[scheme].disabled,
    },

    confirmButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[scheme].text,
    },
    helperText: {
      fontSize: 13,
      marginTop: 6,
    },
    icon: {
      color: Colors[scheme].icon,
      fontSize: 22,
    },
  });
