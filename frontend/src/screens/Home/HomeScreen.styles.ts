import { StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";

export const getStyles = (
    scheme: "light" | "dark",
     fontSize: FontSizeSetting
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
      ...Platform.select({
        web: { height: "100%" as any },
        default: { flex: 1 },
      }),
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: Platform.select({ ios: 75, default: 85 }),
    },
    tabContainer: {
      flexDirection: "row",
      backgroundColor: Colors[scheme].card,
      borderRadius: 20,
      padding: 6,
      borderWidth: 1,
      borderColor: Colors[scheme].secondaryBackground,
      marginBottom: 10,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 16,
    },
    activeTab: {
      backgroundColor: Colors[scheme].primary,
    },
    tabItemContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    tabText: {
      fontSize: scaleFont(14, fontSize),
      fontWeight: "600",
      color: Colors[scheme].icon,
      marginLeft: 6,
    },
    activeTabText: {
      color: Colors[scheme].background,
    },
    mapBox: {
      flex: 1,
      backgroundColor: Colors[scheme].card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: Colors[scheme].secondaryBackground,
      overflow: "hidden",
      position: "relative",
      marginBottom: 10,
    },
    map: {
      width: "100%",
      height: "100%",
    },
    mapContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[scheme].secondaryBackground,
    },
    mapPlaceholderText: {
      color: Colors[scheme].icon,
      fontSize: scaleFont(16, fontSize),
    },

    // 👁️ 눈 모양 버튼 (줌/보기)
    zoomBtn: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors[scheme].card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      zIndex: 5,
    },

    // 📍 내 위치 버튼 (눈 버튼 바로 아래)
    myLocationBtn: {
      position: "absolute",
      top: 70, // 눈 버튼(top:16 + height:44 + margin:10) 바로 아래
      right: 16,
      width: 44,
      height: 44,
      borderRadius: 22, // 둥근 원형
      backgroundColor: Colors[scheme].card, // 테마 배경색 (흰색/검은색)

      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 10,
    },

    mapBottomRow: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    mapBottomButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[scheme].card,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 5,
    },
    countText: {
      color: Colors[scheme].primary,
      fontWeight: "bold",
      marginLeft: 6,
      fontSize: scaleFont(14, fontSize),
    },
    detailText: {
      color: Colors[scheme].primary,
      fontWeight: "bold",
      fontSize: scaleFont(14, fontSize),
    },

    // ✅ [MapFullScreen과 동일하게 맞춘 마커 스타일]
    markerContainer: {
      width: 38,
      height: 38,
      borderRadius: 22,
      backgroundColor: "white",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#4A6EA9",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    markerImage: {
      width: 38,
      height: 38,
      borderRadius: 20,
      resizeMode: "cover",
    },

    buttonSection: { marginBottom: 0 },
    blackButton: {
      width: "100%",
      height: 52,
      backgroundColor: Colors[scheme].primary,
      borderRadius: 26,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
      paddingHorizontal: 24,
      position: "relative",
    },
    startBtn: { height: 58, marginBottom: 0 },
    buttonTextMain: {
      color: Colors[scheme].background,
      fontSize: scaleFont(16, fontSize),
      fontWeight: "bold",
      textAlign: "center",
    },
    buttonContentCentered: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  });
