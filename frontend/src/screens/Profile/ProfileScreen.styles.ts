// ProfileScreen.styles.ts
import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    color: "#000",
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
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
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
    backgroundColor: "#E9ECEF",
    zIndex: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileImageOverlay:{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricBox: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
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
    backgroundColor: "#F1F3F5",
    borderRadius: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3A4A98",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  metricSubLabel: {
    fontSize: 9,
    color: "#868E96",
    marginTop: 2,
  },
  badgeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginRight: 6,
  },
  badgeList: {
    flexDirection: "row",
  },
  badgeIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statsSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  miniStatCard: {
    width: "48.5%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  miniStatIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F3F5",
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
    color: "#000",
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
    backgroundColor: "#6366F1",
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
        color: "#000",
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
});
