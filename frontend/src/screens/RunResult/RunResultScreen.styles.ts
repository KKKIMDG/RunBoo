import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting} from "@/utils/fontScale";

const { width } = Dimensions.get("window");

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    scrollContainer: {
      padding: 0, // 전체 패딩 해제 (이미지처럼 배경이 꽉 차게)
      alignItems: "center",
    },

    // --- 상단 프로필 영역 ---
    profileContainer: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    profileImageContainer: {
      width: 80,
      height: 80,
      borderRadius: 20, // 이미지처럼 살짝 각진 형태
      backgroundColor: "#000",
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
      fontSize: 28,
      fontWeight: "bold",
      color: Colors[scheme].text,
      marginBottom: 5,
    },
    subtitleText: {
      fontSize: 16,
      color: Colors[scheme].text,
      fontWeight: "bold",
    },

    // --- 지도 영역 및 오버레이 ---
    mapContainer: {
      width: width,
      height: (width - 40) * 1.2, // 세로로 약간 긴 형태
      backgroundColor: "#EBEBEB",
      borderRadius: 0, // 이미지처럼 라운드 없음
      overflow: "hidden",
      marginBottom: 20,
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
      fontWeight: "700",
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
      top: 25,
      left: 20,
      zIndex: 10,
    },
    overlayItem: {
      marginBottom: 20,
    },
    overlayLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: Colors[scheme].text,
      marginBottom: 2,
    },
    overlayValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    overlayValue: {
      fontSize: 28,
      fontWeight: "900", // 아주 굵게
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
      marginBottom: 12,
      fontWeight: "bold",
    },
    bottomInfoValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    bottomInfoValue: {
      fontSize: 26,
      fontWeight: "bold",
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
      marginBottom: 40,
    },
    shareButton: {
      backgroundColor: "#3B4D9A", // 이미지의 남색
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
      borderRadius: 15,
      marginBottom: 12,
    },
    shareButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 10,
    },
    homeButton: {
      backgroundColor: "transparent",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    homeButtonText: {
      color: Colors[scheme].text,
      fontSize: 17,
      fontWeight: "bold",
      marginLeft: 10,
    },

    icon: {
      fontSize: 24,
      color: Colors[scheme].text,
    },
  });
