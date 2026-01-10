import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const getStyles = (scheme: "light" | "dark") => {
  // 테마별 색상 가독성을 위해 상수로 추출 (선택 사항)
  const theme = Colors[scheme];

  return StyleSheet.create({
    overlay: {
      flex: 1,
      // 배경 오버레이는 보통 어두운 투명색을 유지하거나 테마 배경색에 투명도를 줍니다.
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: SCREEN_WIDTH * 0.85,
      backgroundColor: theme.background, // ✅ 테마 배경색 적용
      borderRadius: 30,
      padding: 24,
      alignItems: "center",
      // 다크모드에서 컨테이너가 너무 묻히지 않도록 미세한 테두리 추가 가능
      borderWidth: scheme === "dark" ? 1 : 0,
      borderColor: theme.border,
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text, // ✅ 테마 텍스트 색상
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.subtext || "#8E8E93", // ✅ 테마 보조 텍스트 색상
      textAlign: "center",
    },
    featureList: {
      width: "100%",
      backgroundColor: theme.card || "#F8F9FB", // ✅ 테마 카드 배경색
      borderRadius: 20,
      padding: 16,
      marginBottom: 24,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureText: {
      marginLeft: 12,
    },
    featureTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text, // ✅ 테마 텍스트 색상
    },
    featureDesc: {
      fontSize: 12,
      color: theme.subtext || "#8E8E93", // ✅ 테마 보조 텍스트 색상
    },
    pricingContainer: {
      alignItems: "center",
      marginBottom: 30,
      borderTopWidth: 1,
      borderTopColor: theme.border || "#F2F2F7", // ✅ 테마 테두리 색상
      width: "100%",
      paddingTop: 20,
    },
    priceLabel: {
      fontSize: 12,
      color: theme.subtext || "#8E8E93",
      marginBottom: 4,
    },
    priceValue: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text, // ✅ 테마 텍스트 색상
    },
    trialText: {
      fontSize: 12,
      color: theme.subtext || "#8E8E93",
      marginTop: 4,
    },
    buttonGroup: {
      width: "100%",
    },
    primaryButton: {
      backgroundColor: theme.primary || "#3F4E96", // ✅ 테마 주요 색상
      borderRadius: 16,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    primaryButtonText: {
      color: theme.primaryButtonText || "white", // ✅ 버튼용 텍스트 색상
      fontSize: 16,
      fontWeight: "700",
    },
    secondaryButton: {
      backgroundColor: theme.card || "#F2F2F7", // ✅ 테마 카드/버튼 배경색
      borderRadius: 16,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    secondaryButtonText: {
      color: theme.subtext || "#8E8E93", // ✅ 테마 보조 텍스트 색상
      fontSize: 16,
      fontWeight: "600",
    },
  });
};
