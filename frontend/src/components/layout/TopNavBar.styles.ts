// Login.styles.ts
// - 스타일 정의: 레이아웃, 입력창, 버튼, 소셜아이콘 등.
// - 필요 시 theme/토큰으로 추상화하세요.
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    root: {
      width: "100%",
      height: 60,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      backgroundColor: Colors[scheme].background,
      borderBottomColor: Colors[scheme].border,
      borderBottomWidth: 1,
    },

    profileImageWrapper: {
      width: 45,
      height: 45,
      borderRadius: 14,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[scheme].background,
      zIndex: 10,
    },

    profileImage: {
      width: "100%",
      height: "100%",
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[scheme].background,
    },

    logoContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },

    logoText: {
      fontFamily: "FugazOne_400Regular",
      fontSize: 24,
      letterSpacing: 0.8,
      color: Colors[scheme].text,
    },

    bellButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
      backgroundColor: Colors[scheme].card,
      borderWidth: 1,
      borderColor: Colors[scheme].borders,
      zIndex: 10,
    },

    iconWrapper: {
      position: "relative",
    },

    dot: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#FF3B30",
      borderWidth: 1.5,
      borderColor: Colors[scheme].background,
    },

    icon: {
      color: Colors[scheme].icon,
      fontSize: 22,
    },
  });
