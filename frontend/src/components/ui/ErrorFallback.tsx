import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "@/screens/Settings/useSettings";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { getStyles } from "@/components/ui/ErrorFallback.styles";

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

/**
 * 공통 에러 폴백 컴포넌트
 *
 * @param message - 사용자에게 보여줄 에러 메시지 (기본: "문제가 발생했어요")
 * @param onRetry - 재시도 버튼 클릭 시 실행할 함수
 * @param showHomeButton - 홈으로 돌아가기 버튼 표시 여부 (기본: true)
 * @param showRetryButton - 재시도 버튼 표시 여부 (기본: true)
 */
export default function ErrorFallback({
  message = "문제가 발생했어요",
  onRetry,
  showHomeButton = true,
  showRetryButton = true,
}: ErrorFallbackProps) {
  const navigation = useNavigation<any>();
  const { settings } = useSettings();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);

  const styles = useMemo(() => {
    return getStyles(resolvedTheme, settings?.fontSize || "MEDIUM");
  }, [resolvedTheme, settings?.fontSize]);

  const handleGoHome = () => {
    // 네비게이션 스택을 리셋하고 홈으로 이동
    navigation.reset({
      index: 0,
      routes: [{ name: "MainStack" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 에러 아이콘 */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={styles.icon.color}
          />
        </View>

        {/* 에러 메시지 */}
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subtitle}>잠시 후 다시 시도해주세요</Text>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          {showRetryButton && onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={styles.retryButtonText.color}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          )}

          {showHomeButton && (
            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
              activeOpacity={0.7}
            >
              <Ionicons
                name="home"
                size={20}
                color={styles.homeButtonText.color}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
