import { StyleSheet, Platform, Dimensions } from "react-native";
import { Colors, Fonts } from "@/constants/theme";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";

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
      paddingTop: 0,
      paddingBottom: 0,
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
      marginBottom: 5,
    },
    statusTag: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginLeft: 4,
      marginTop: 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: scaleFont(10, fontSize),
      color: activeColors.text,
      fontFamily: Fonts?.gmarketBold,
    },

    // --- 지도 영역 ---
    mapContainer: {
      height: 340,
      borderRadius: 0,
      overflow: "visible",
      marginBottom: 0,
      backgroundColor: activeColors.background,
      position: "relative",
    },

    // --- 메인 통계 (지도 위 오버레이) ---
    mainStatsContainer: {
      position: "absolute",
      top: 10,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
      zIndex: 10,
      pointerEvents: "none",
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 16,
    },
    timeLabel: {
      fontSize: scaleFont(12, fontSize),
      fontWeight: "bold",
      color: subTextColor,
      marginRight: 8,
    },
    timeValue: {
      fontSize: scaleFont(20, fontSize),
      fontWeight: "bold",
      color: activeColors.text,
      fontVariant: ["tabular-nums"],
      letterSpacing: 2,
    },
    distanceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 16,
    },
    distanceLabel: {
      fontSize: scaleFont(12, fontSize),
      color: subTextColor,
      fontWeight: "bold",
      marginRight: 8,
    },
    distanceValue: {
      fontSize: scaleFont(30, fontSize),
      fontWeight: "bold",
      color: activeColors.secondary,
      marginBottom: 20,
      fontVariant: ["tabular-nums"],
      fontFamily: Fonts?.mono,
    },
    distanceUnit: {
      fontSize: scaleFont(20, fontSize),
      color: activeColors.text,
      marginLeft: 4,
    },

    // --- 지도 플레이스홀더 ---
    mapPlaceholder: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: activeColors.secondaryBackground,
    },
    mapPlaceholderText: {
      fontSize: scaleFont(14, fontSize),
      color: subTextColor,
    },

    // --- 페이스/케이던스 표시 ---
    paceStatsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 0,
      marginBottom: 0,
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: activeColors.background,
    },
    paceStatItem: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    paceStatLabel: {
      fontSize: scaleFont(12, fontSize),
      color: subTextColor,
      marginRight: 8,
      fontWeight: "bold",
    },
    paceStatValue: {
      fontSize: scaleFont(20, fontSize),
      fontWeight: "bold",
      color: activeColors.text,
    },
    paceStatUnit: {
      fontSize: scaleFont(16, fontSize),
      color: subTextColor,
    },

    // --- 정보 카드 컨테이너 ---
    statsContainer: {
      backgroundColor: scheme === "light" ? "#FFFFFF" : activeColors.card,
      borderRadius: 15,
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
      backgroundColor: activeColors.background,
      borderRadius: 0,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 0,
      borderWidth: 0,
      borderColor: activeColors.border,
    },
    chartTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      marginLeft: 0,
    },
    chartTitle: {
      fontSize: scaleFont(14, fontSize),
      fontWeight: "800",
      color: activeColors.text,
      marginTop: 0,
      marginLeft: 8,
    },
    chart: {
      marginVertical: 0,
      borderRadius: 16,
      marginLeft: 0,
    },
    chartLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    chartLabelText: {
      fontSize: scaleFont(12, fontSize),
      color: subTextColor,
      marginLeft: 0,
      marginRight: 0,
      fontWeight: "600",
    },

    // --- 하단 컨트롤 버튼 ---
    controlContainer: {
      position: "absolute",
      bottom: 20,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      zIndex: 15,
    },
    pauseButton: {
      backgroundColor: activeColors.background,
      width: 70,
      height: 50,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: activeColors.border,
    },
    stopButton: {
      backgroundColor: "#FF3B30",
      width: 70,
      height: 50,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    voiceSettingButton: {
      fontSize: scaleFont(12, fontSize),
      color: "#4A6EA9",
    },
    voiceOnOffButton: {
      fontSize: scaleFont(12, fontSize),
      marginLeft: 4,
    },
  });
};
