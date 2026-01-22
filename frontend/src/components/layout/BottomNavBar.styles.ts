// Login.styles.ts
// - 스타일 정의: 레이아웃, 입력창, 버튼, 소셜아이콘 등.
// - 필요 시 theme/토큰으로 추상화하세요.
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
    ) =>
  StyleSheet.create({
    root: {
      position: "absolute", // 화면에 고정
      bottom: 0, // 맨 밑에 밀착
      left: 0,
      right: 0,
      width: "100%",
      height: 75, // 아이폰 하단 홈 바 영역을 고려하여 높이 설정
      borderTopColor: Colors[scheme].border,
      borderTopWidth: 1,
      backgroundColor: Colors[scheme].background,

      elevation: 20, // 안드로이드 그림자
      shadowColor: Colors[scheme].shadow, // iOS 그림자
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      flex: 1,
    },
    button: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    },
    activeBar: {
      position: "absolute",
      top: -1, // 상단 보더에 딱 붙게 설정
      width: 40,
      height: 3,
      borderRadius: 2,
      backgroundColor: Colors[scheme].primary,
    },
    tabText: {
      fontSize: scaleFont(10, fontSize),
      marginTop: 4,
    },
    activeText: {
      color: Colors[scheme].text,
      fontWeight: "700",
    },
    inactiveText: {
      color: Colors[scheme].tabIconDefault,
      fontWeight: "400",
    },
  });
