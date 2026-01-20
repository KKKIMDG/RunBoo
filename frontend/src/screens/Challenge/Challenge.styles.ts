// src/screens/Challange/Challenge.styles.ts
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
      backgroundColor: Colors[scheme].background, // rgba(248, 249, 250, 1) 대응
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    // --- 헤더 섹션 수정 ---
    header: {
      marginLeft: 12,
    },
    backButton: {
      marginRight: 12, // 버튼과 텍스트 사이 간격
      marginLeft: -4, // 버튼 아이콘의 여백 때문에 조금 왼쪽으로 당김
    },
    headerTitle: {
      fontSize: scaleFont(24, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      lineHeight: 32,
    },
    headerTextContainer: {
      flex: 1, // 남은 공간 모두 차지
    },
    headerSubtitle: {
      fontSize: scaleFont(14, fontSize),
      color: Colors[scheme].icon, // rgba(134, 142, 150, 1) 대응
      marginTop: 4,
    },
    // 탭 스위처 (진행 중 / 완료)
    tabSwitcher: {
      flexDirection: "row",
      backgroundColor: Colors[scheme].card,
      borderRadius: 20,
      padding: 7,
      borderWidth: 1,
      borderColor: Colors[scheme].secondaryBackground,
      marginBottom: 10,
      marginTop: 10,
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
    },
    tabButtonActive: {
      backgroundColor: Colors[scheme].primary, // rgba(58, 74, 152, 1) 대응
    },
    tabButtonText: {
      fontSize: scaleFont(14, fontSize),
      fontWeight: "600",
      color: Colors[scheme].icon,
      marginLeft: 8,
    },
    tabButtonTextActive: {
      color: "#FFF",
    },
    // 달성 현황 카드 (완료 탭 전용)
    summaryCard: {
      width: "100%",
      padding: 25,
      backgroundColor: Colors[scheme].card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: Colors[scheme].secondaryBackground,
      alignItems: "center",
      marginBottom: 20,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      alignSelf: "flex-start",
    },
    summaryHeaderText: {
      fontSize: scaleFont(16, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      marginLeft: 8,
    },
    summaryValueContainer: {
      alignItems: "center",
    },
    summaryValue: {
      fontSize: scaleFont(36, fontSize),
      fontWeight: "700",
      color: Colors[scheme].primary, // rgba(46, 61, 110, 1) 계열
      letterSpacing: 0.37,
    },
    summaryLabel: {
      fontSize: scaleFont(12, fontSize),
      color: Colors[scheme].icon,
      marginTop: 4,
    },
    summaryIconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: "rgba(255, 215, 0, 0.15)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    summaryInfo: {
      flex: 1,
    },
    summaryTitle: {
      fontSize: scaleFont(16, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      marginBottom: 4,
    },
    summaryCount: {
      fontSize: scaleFont(14, fontSize),
      color: Colors[scheme].icon,
    },
    // 완료된 도전과제 카드
    completedCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[scheme].card,
      borderRadius: 24,
      padding: 21,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].secondaryBackground,
    },
    badgeIconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: "rgba(46, 61, 110, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: scaleFont(18, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      marginBottom: 4,
    },
    cardDate: {
      fontSize: scaleFont(12, fontSize),
      color: Colors[scheme].icon,
      marginBottom: 4,
    },
    cardReward: {
      fontSize: scaleFont(14, fontSize),
      color: Colors[scheme].primary,
    },
    listContainer: {
      paddingBottom: 100,
    },
    challengeCard: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].secondaryBackground,
      // 그림자 (iOS)
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      // 그림자 (Android)
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    challengeTitle: {
      fontSize: scaleFont(18, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
    },
    levelBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    levelText: {
      fontSize: scaleFont(11, fontSize),
      fontWeight: "700",
      color: "#FFF",
    },
    challengeDescription: {
      fontSize: scaleFont(14, fontSize),
      color: Colors[scheme].icon,
      marginBottom: 20,
      lineHeight: 20,
    },
    progressSection: {
      marginBottom: 15,
    },
    progressInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: scaleFont(12, fontSize),
      color: Colors[scheme].icon,
    },
    progressValue: {
      fontSize: scaleFont(12, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: Colors[scheme].secondaryBackground,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: Colors[scheme].primary,
      borderRadius: 3,
    },
    // 하단 정보 블록 레이아웃 (사진 디자인 핵심)
    infoBlockContainer: {
      flexDirection: "row",
      gap: 10,
      marginTop: 5,
    },
    infoBlock: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#2C2C2E" : "#F3F4F6",
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 14,
    },
    infoIcon: {
      marginRight: 10,
    },
    infoLabel: {
      fontSize: scaleFont(10, fontSize),
      color: Colors[scheme].icon,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: scaleFont(13, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
    },
    // 모달 오버레이
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    // 모달 컨테이너
    modalContainer: {
      width: "85%",
      backgroundColor: Colors[scheme].card,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    modalTitle: {
      fontSize: scaleFont(20, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      marginBottom: 12,
    },
    modalMessage: {
      fontSize: scaleFont(15, fontSize),
      color: Colors[scheme].icon,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },
    modalButtonContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
    },
    modalButton: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    modalButtonAccept: {
      backgroundColor: Colors[scheme].primary,
    },
    modalButtonReject: {
      backgroundColor: Colors[scheme].secondaryBackground,
    },
    modalButtonText: {
      fontSize: scaleFont(16, fontSize),
      fontWeight: "600",
    },
    modalButtonTextAccept: {
      color: "#FFF",
    },
    modalButtonTextReject: {
      color: Colors[scheme].icon,
    },
  });
