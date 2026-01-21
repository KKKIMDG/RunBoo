import { Dimensions, StyleSheet } from "react-native";
import { Colors, Fonts } from "@/constants/theme";
import { FontSizeSetting } from "@/utils/fontScale";

const { width } = Dimensions.get("window");

export const getStyles = (
  scheme: "light" | "dark",
  fontSize: FontSizeSetting,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    contentContainer: {
      flex: 1,
    },
    viewShotContainer: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    scrollContainer: {
      padding: 0,
      alignItems: "center",
    },

    // --- 로고 이미지 ---
    logoContainer: {
      position: "absolute",
      left: 0,
      alignItems: "center",
      zIndex: 20,
      pointerEvents: "none", // 터치 이벤트 통과
    },
    logoImage: {
      width: 40,
      height: 40,
      borderRadius: 16,
    },
    timeText: {
      fontSize: 13,
      fontFamily: Fonts?.gmarketBold,
      color: Colors[scheme].text,
      position: "absolute",
      top: 12,
      left: 10,
    },

    // --- 지도 영역 및 오버레이 ---
    mapContainer: {
      flex: 1,
      backgroundColor: "#EBEBEB",
      borderRadius: 0,
      overflow: "hidden",
      position: "relative",
    },
    mapPlaceholderContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },
    placeholderTitle: {
      marginTop: 8,
      fontSize: 18,
      fontFamily: Fonts?.gmarketBold,
      color: Colors[scheme].text,
    },
    placeholderSubtitle: {
      marginTop: 6,
      textAlign: "center",
      color: Colors[scheme].subtext,
      fontSize: 14,
      lineHeight: 20,
    },

    // ✅ 지도 위 스탯 오버레이 스타일
    statsOverlay: {
      position: "absolute",
      top: 50,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-around",
      zIndex: 10,
    },
    overlayItem: {
      alignItems: "center",
    },
    overlayLabel: {
      fontSize: 13,
      fontWeight: "bold",
      color: Colors[scheme].text,
      marginBottom: 2,
    },
    overlayValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    overlayDistance: {
      marginTop: 5,
      fontSize: 35,
      fontFamily: Fonts?.gmarketBold,
      color: Colors[scheme].text,
    },
    overlayValue: {
      marginTop: 5,
      fontSize: 25,
      fontFamily: Fonts?.gmarketBold,
      color: Colors[scheme].text,
    },
    overlayUnit: {
      fontSize: 18,
      fontWeight: "bold",
      color: Colors[scheme].text,
      marginLeft: 4,
    },

    // 지도 내 내비게이션 아이콘
    mapActionIcon: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },

    // --- 하단 3개 지표 (평균속도, 칼로리, 케이던스) ---
    bottomInfoContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      paddingVertical: 20,
      borderBottomWidth: 0,
    },
    bottomInfoItem: {
      alignItems: "center",
      flex: 1,
    },
    bottomInfoLabel: {
      fontSize: 14,
      color: Colors[scheme].text,
      marginBottom: 10,
      fontWeight: "bold",
    },
    bottomInfoValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    bottomInfoValue: {
      fontSize: 20,
      fontFamily: Fonts?.gmarketBold,
      color: Colors[scheme].text,
    },
    bottomInfoUnit: {
      fontSize: 14,
      color: Colors[scheme].text,
      marginLeft: 4,
      fontWeight: "bold",
    },

    // --- 버튼 ---
    buttonContainer: {
      width: "100%",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor: Colors[scheme].background,
    },
    shareButton: {
      backgroundColor: Colors[scheme].background,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
      borderRadius: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
    },
    shareButtonText: {
      color: Colors[scheme].text,
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 10,
    },
    homeButton: {
      backgroundColor: Colors[scheme].primary,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
      borderRadius: 15,
      borderWidth: 0,
    },
    homeButtonText: {
      color: Colors[scheme].background,
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 10,
    },

    icon: {
      fontSize: 24,
      color: Colors[scheme].text,
    },
  });
