import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    inputGroup: {
      gap: 6,
    },
    inputWrapper: {
      position: "relative",
      flex: 1,
    },

    inputRightText: {
      position: "absolute",
      right: 6,
      top: "45%",
      transform: [{ translateY: -8 }],
      fontSize: 16,
      color: "#ef4444",
    },
    label: {
      fontSize: 12,
      color: Colors[scheme].icon,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginLeft: 4,
    },
    // 일반 입력창 컨테이너
    inputBox: {
      height: 53,
      width: "100%",
    },
    // 이메일/인증코드 전용 컨테이너 (버튼 포함)
    inlineInputBox: {
      height: 53,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 15,
      backgroundColor: Colors[scheme].card,
      borderWidth: 0.6,
      borderColor: Colors[scheme].secondaryBackground,
      paddingRight: 10,
      overflow: "hidden",
    },
    // 공통 텍스트 입력 스타일 (테두리 없음, 인라인용)
    textInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 16,
      fontSize: 16,
      color: Colors[scheme].text,
    },
    // 일반 텍스트 입력 스타일 (테두리 있음, 단독용)
    textInputBox: {
      flex: 1,
      height: "100%",
      borderRadius: 15,
      backgroundColor: Colors[scheme].card,
      borderWidth: 0.6,
      borderColor: Colors[scheme].secondaryBackground,
      paddingHorizontal: 16,
      fontSize: 16,
      color: Colors[scheme].text,
    },
    // 인라인 버튼 (인증, 확인 등)
    inlineButton: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: Colors[scheme].text,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      zIndex: 10,
    },
    inlineButtonText: {
      color: Colors[scheme].background,
      fontSize: 14,
      fontWeight: "700",
    },
    // 입력칸 비활성화
    inputTextDisabled: {
      color: "#9ca3af", // 회색 (tailwind gray-400 느낌)
    },
    // 버튼 비활성화
    inlineButtonDisabled: {
      backgroundColor: "#e5e7eb",
    },
  });
