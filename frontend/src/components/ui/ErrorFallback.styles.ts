import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";

export const getStyles = (
  scheme: "light" | "dark",
  fontSize: FontSizeSetting,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    content: {
      width: "100%",
      maxWidth: 400,
      alignItems: "center",
    },
    iconContainer: {
      marginBottom: 24,
    },
    icon: {
      color: Colors[scheme].error,
    },
    title: {
      fontSize: scaleFont(28, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      marginBottom: 12,
    },
    message: {
      fontSize: scaleFont(18, fontSize),
      fontWeight: "600",
      color: Colors[scheme].text,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: scaleFont(14, fontSize),
      color: Colors[scheme].icon,
      textAlign: "center",
      marginBottom: 40,
    },
    buttonContainer: {
      width: "100%",
      gap: 12,
    },
    retryButton: {
      flexDirection: "row",
      backgroundColor: Colors[scheme].tint,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: scaleFont(16, fontSize),
      fontWeight: "600",
    },
    homeButton: {
      flexDirection: "row",
      backgroundColor: Colors[scheme].background,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors[scheme].border,
    },
    homeButtonText: {
      color: Colors[scheme].text,
      fontSize: scaleFont(16, fontSize),
      fontWeight: "600",
    },
  });
