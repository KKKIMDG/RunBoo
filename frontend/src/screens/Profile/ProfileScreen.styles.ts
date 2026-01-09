// ProfileScreen.styles.ts
import { StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      height: 60,
      marginTop: Platform.OS === "android" ? 10 : 0, // 안드로이드 데드존 대응
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: Colors[scheme].text,
      textAlign: "center",
    },
    headerRightIcon: {
      width: 40,
      alignItems: "flex-end",
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: Colors[scheme].background,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
    },
    userHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    profileImagePlaceholder: {
      width: 60,
      height: 60,
      marginRight: 15,
      overflow: "hidden",
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[scheme].background,
      zIndex: 10,
    },
    profileImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    profileImageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      color: Colors[scheme].text,
    },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    metricBox: {
      width: "31%",
      aspectRatio: 1,
      backgroundColor: Colors[scheme].background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    metricIconPlaceholder: {
      width: 40,
      height: 30,
      backgroundColor: Colors[scheme].background,
      borderRadius: 8,
      marginBottom: 8,
    },
    metricLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: Colors[scheme].text,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: "800",
      color: Colors[scheme].text,
    },
    metricSubLabel: {
      fontSize: 12,
      color: "#868E96",
      marginTop: 4,
    },
    badgeSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    badgeSectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors[scheme].text,
      marginRight: 6,
    },
    badgeList: {
      flexDirection: "row",
    },
    badgeIconPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors[scheme].background,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 6,
    },
    statsSummaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    miniStatCard: {
      width: "48.5%",
      backgroundColor: Colors[scheme].background,
      borderRadius: 24,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors[scheme].border,
    },
    miniStatIconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors[scheme].background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    miniStatLabel: {
      fontSize: 11,
      color: "#868E96",
      fontWeight: "600",
    },
    miniStatValue: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors[scheme].text,
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 12,
      gap: 8,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    legendBox: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
    legendText: {
      fontSize: 10,
      color: "#ADB5BD",
    },

    // ===== Grass (GitHub 스타일 추가) =====
    grassGrid: {
      marginTop: 4,
    },

    grassColumns: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    grassColumn: {
      flexDirection: "column",
      gap: 3,
    },

    grassCell: {
      width: 22,
      height: 22,
      borderRadius: 3,
    },

    grassCellInvisible: {
      width: 12,
      height: 12,
      borderRadius: 3,
      backgroundColor: "transparent",
    },

    grassFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    grassFooterText: {
      fontSize: 11,
      color: "#3A4A98",
      fontWeight: "600",
    },

    /* ===== header row ===== */
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },

    /* ===== tier button ===== */
    tierButton: {
      backgroundColor: Colors[scheme].primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 12,
      alignSelf: "flex-start",
    },
    tierButtonText: {
      color: "#FFF",
      fontSize: 12,
      fontWeight: "bold",
      marginLeft: 6,
    },
    grassTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    grassTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: Colors[scheme].text,
    },

    grassLegend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10, // RN 0.71+면 OK, 아니면 아래 대안 참고
    },

    grassLegendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    grassLegendDot: {
      width: 12,
      height: 12,
      borderRadius: 4, // 이미지처럼 살짝 둥근 네모 느낌
    },

    grassLegendText: {
      fontSize: 12,
      color: "#8E8E93", // iOS 보조 텍스트 느낌
      fontWeight: "600",
    },
    icon: {
      fontSize: 24,
      color: Colors[scheme].icon,
    },
  });
