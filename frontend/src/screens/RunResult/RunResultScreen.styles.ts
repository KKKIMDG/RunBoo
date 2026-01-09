import { Dimensions, StyleSheet, Platform } from "react-native";
import { Colors, FontSizes } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    scrollContainer: {
      padding: 20,
      alignItems: "center",
    },
    // --- 상단 프로필 영역 ---
    profileContainer: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 30,
    },
    profileImageContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: Colors[scheme].background,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
      overflow: "hidden",
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    titleText: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[scheme].text,
      marginBottom: 5,
    },
    subtitleText: {
      fontSize: 16,
      color: Colors[scheme].subtext,
      fontWeight: "600",
    },

    // --- 요약 통계 영역 ---
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginBottom: 25,
      marginTop: 10,
      marginLeft: 6,
    },
    summaryItem: {
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 14,
      color: Colors[scheme].subtext,
      marginTop: 8,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[scheme].text,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    },
    summaryUnit: {
      fontSize: 12,
      color: Colors[scheme].subtext,
    },

    // --- 지도 영역 ---
    mapContainer: {
      width: width - 40,
      height: width - 40,
      backgroundColor: Colors[scheme].secondaryBackground,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 30,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
        },
        android: { elevation: 5 },
      }),
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    mapPlaceholderText: {
      color: Colors[scheme].subtext,
      fontSize: 16,
    },
    logoContainer: {
      position: "absolute",
      bottom: 15,
      right: 15,
    },
    logoImage: {
      width: 40,
      height: 40,
      resizeMode: "contain",
    },

    buttonContainer: {
      width: "100%",
      marginBottom: 30,
      marginTop: 20,
    },
    shareButton: {
      backgroundColor: Colors[scheme].primary,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
      borderRadius: 30,
      marginBottom: 15,
    },
    shareButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 10,
    },
    homeButton: {
      backgroundColor: Colors[scheme].card,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: scheme === "dark" ? "#333" : "#E0E0E0",
    },
    homeButtonText: {
      color: Colors[scheme].text,
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 10,
    },

    bottomInfoContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    bottomInfoCard: {
      backgroundColor: Colors[scheme].card,
      width: (width - 60) / 2,
      padding: 20,
      borderRadius: 15,
    },
    bottomInfoLabel: {
      fontSize: 14,
      color: Colors[scheme].subtext,
      marginBottom: 10,
    },
    bottomInfoValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[scheme].text,
    },

    icon: {
      fontSize: 28,
      color: Colors[scheme].icon,
    },
  });
