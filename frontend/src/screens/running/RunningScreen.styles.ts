import { StyleSheet, Platform, Dimensions } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";

const { width } = Dimensions.get("window");

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) => {
  // ✅ Colors 객체가 존재하는지 방어 코드 추가
  const activeColors = Colors?.[scheme] ??
    Colors?.light ?? {
      background: "#F5F6F8",
      text: "#1A1A1A",
      card: "#FFFFFF",
      border: "#EEEEEE",
      primary: "#4A6EA9",
    };

  const subTextColor = scheme === "light" ? "#8E8E93" : "#AAAAAA";
  const shadowColor = "#000";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeColors.background,
    },
    scrollContainer: {
      padding: 20,
      paddingBottom: 150,
    },

    // --- 카운트다운 오버레이 ---
    countdownOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: activeColors.background,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    countdownText: {
      fontSize: scaleFont(120, fontSize),
      fontWeight: "bold",
      color: activeColors.primary,
      fontVariant: ["tabular-nums"],
    },
    countdownLabel: {
      fontSize: scaleFont(24, fontSize),
      fontWeight: "600",
      color: activeColors.text,
      marginTop: 20,
    },

    // --- 상단 헤더 ---
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    statusTag: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: activeColors.card,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: activeColors.border,
      ...Platform.select({
        ios: { shadowColor, shadowOpacity: 0.1, shadowRadius: 5 },
        android: { elevation: 3 },
      }),
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: scaleFont(16, fontSize),
      fontWeight: "bold",
      color: activeColors.text,
    },

    // --- 정보 카드 컨테이너 ---
    statsContainer: {
      backgroundColor: scheme === "light" ? "#FFFFFF" : activeColors.card,
      borderRadius: 25,
      padding: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: activeColors.border,
      ...Platform.select({
        ios: { shadowColor, shadowOpacity: 0.05, shadowRadius: 15 },
        android: { elevation: 5 },
      }),
    },

    statBox: {
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 12,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    statLabel: {
      fontSize: scaleFont(15, fontSize),
      color: subTextColor,
      fontWeight: "500",
      marginLeft: 6,
    },
    statValueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    statValue: {
      fontSize: scaleFont(24, fontSize),
      fontWeight: "700",
      color: activeColors.text,
      fontVariant: ["tabular-nums"],
      letterSpacing: -0.5,
    },
    statValueHighlight: {
      color: scheme === "light" ? "#2D3269" : activeColors.primary,
    },
    statUnit: {
      fontSize: scaleFont(14, fontSize),
      color: subTextColor,
      fontWeight: "500",
      marginLeft: 4,
    },

    // --- 차트 영역 ---
    chartCard: {
      backgroundColor: activeColors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: activeColors.border,
    },
    chartTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    chartTitle: {
      fontSize: scaleFont(16, fontSize),
      fontWeight: "800",
      color: activeColors.text,
      marginLeft: 8,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
      marginLeft: -15,
    },
    chartLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    chartLabelText: {
      fontSize: scaleFont(12, fontSize),
      color: subTextColor,
      fontWeight: "600",
    },

    // --- 지도 영역 ---
    mapContainer: {
      height: 300,
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 20,
      backgroundColor: activeColors.card,
      borderWidth: 1,
      borderColor: activeColors.border,
    },

    // --- 하단 컨트롤 버튼 ---
    controlContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: activeColors.card,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 30,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderTopWidth: 1,
      borderTopColor: activeColors.border,
    },
    pauseButton: {
      backgroundColor: activeColors.background,
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 24,
      borderWidth: 1,
      borderColor: activeColors.border,
    },
    stopButton: {
      backgroundColor: "#FF3B30",
      width: 80,
      height: 80,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
    },
    voiceSettingButton: {
      fontSize: scaleFont(12, fontSize),
      color: "#4A6EA9"
    },
    voiceOnOffButton:{
      fontSize: scaleFont(12, fontSize),
      marginLeft: 4,
    }

  });
};
