import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchAiStatus, analyzeRunRecords } from "@/services/ai/aiService";
import Markdown from "react-native-markdown-display";
import { Colors } from "@/constants/theme";
import PremiumModal from "@/screens/records/components/PremiumModal";

export default function AiAnalysisCard() {
  const colorScheme = useColorScheme() ?? "light";

  const [premiumVisible, setPremiumVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // 무료 분석 횟수 상태
  const [freeAnalysisCount, setFreeAnalysisCount] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);
  const markdownStyles = useMemo(
    () => getMarkdownStyles(colorScheme),
    [colorScheme]
  );

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await fetchAiStatus();
      setFreeAnalysisCount(status.remainingCount);
      setIsSubscribed(status.isSubscribed);
    } catch (error) {
      console.error("AI Status Load Failed:", error);
      // 에러 시 0으로 설정하여 무한 로딩 방지 및 잠금 처리
      setFreeAnalysisCount(0);
    }
  };

  const handleAnalyze = async () => {
    // 로딩 전, 무료 횟수가 없고 구독도 안 했으면 결제 유도
    if (freeAnalysisCount !== null && freeAnalysisCount <= 0 && !isSubscribed) {
      setPremiumVisible(true);
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeRunRecords();
      
      if (response.markdownContent) {
        setAnalysisResult(response.markdownContent);
      }
      setFreeAnalysisCount(response.remainingCount);
      setIsSubscribed(response.isSubscribed);
      
    } catch (error: any) {
      console.error(error);
      Alert.alert("분석 실패", error?.message || "잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const isStatusLoading = freeAnalysisCount === null;
  const canAnalyze = (freeAnalysisCount ?? 0) > 0 || isSubscribed;
  const isLocked = !canAnalyze && !isStatusLoading;

  return (
    <View style={styles.container}>
      {/* 1. 헤더 */}
      <View style={styles.header}>
        <Ionicons
          name="ribbon-outline"
          size={20}
          color={Colors[colorScheme].icon}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.title}>AI 분석 리포트</Text>
      </View>

      {/* 2. 컨텐츠 영역 */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={Colors[colorScheme].tint} />
            <Text style={styles.loadingText}>데이터 분석중...</Text>
          </View>
        ) : analysisResult ? (
          <Markdown style={markdownStyles}>{analysisResult}</Markdown>
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.placeholderTitle}>아직 분석 결과가 없어요</Text>
            <Text style={styles.placeholderText}>
              버튼을 눌러 이번 달 러닝 기록을{"\n"}분석해보세요!
            </Text>
          </View>
        )}
      </View>

      {/* 3. 하단 버튼 블록 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (loading || isStatusLoading) && styles.buttonDisabled,
            isLocked && !loading && { backgroundColor: Colors[colorScheme].disabled },
          ]}
          onPress={handleAnalyze}
          disabled={loading || isStatusLoading}
          activeOpacity={0.85}
        >
          <View style={styles.buttonContent}>
            {isStatusLoading ? (
               <ActivityIndicator size="small" color={Colors[colorScheme].subtext} style={{ marginRight: 6 }} />
            ) : (
              isLocked && (
                <Ionicons
                  name="lock-closed"
                  size={18}
                  style={{
                    marginRight: 6,
                    color: Colors[colorScheme].disabledText,
                  }}
                />
              )
            )}
            
            <Text
              style={[
                styles.buttonText,
                isLocked && { color: Colors[colorScheme].disabledText },
                (loading || isStatusLoading) && { color: Colors[colorScheme].subtext },
              ]}
            >
              {loading
                ? "분석중..."
                : isStatusLoading
                ? "확인 중..."
                : canAnalyze
                ? "AI 분석 시작"
                : "프리미엄 분석"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 버튼 외부 하단 안내 문구 블록 */}
        {!loading && !isStatusLoading && (
          <View style={styles.subTextContainer}>
            <Text
              style={[
                styles.subText,
                !canAnalyze && { color: "#AEAEB2" },
              ]}
            >
              {isSubscribed
                ? "프리미엄 구독 중입니다"
                : (freeAnalysisCount ?? 0) > 0
                ? `이번 달 무료 분석 ${freeAnalysisCount}회 남음`
                : "이번 달 무료 분석 횟수를 모두 소진했어요"}
            </Text>
          </View>
        )}
      </View>


      <PremiumModal
        visible={premiumVisible}
        onClose={() => setPremiumVisible(false)}
        onStartPremium={() => {
          setPremiumVisible(false);
          Alert.alert("알림", "프리미엄 결제 로직을 실행합니다.");
        }}
      />
    </View>
  );
}

const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors[scheme].secondaryBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    title: { fontSize: 18, fontWeight: "700", color: Colors[scheme].text },
    contentContainer: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
      padding: 20,
      minHeight: 140,
      justifyContent: "center",
      marginBottom: 16,
    },
    centerBox: { alignItems: "center", justifyContent: "center" },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: Colors[scheme].subtext,
      fontWeight: "500",
    },
    placeholderTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[scheme].text,
      marginBottom: 6,
    },
    placeholderText: {
      textAlign: "center",
      color: Colors[scheme].tabIconDefault,
      fontSize: 14,
      lineHeight: 20,
    },

    footer: {
      alignItems: "center",
    },
    button: {
      width: "100%",
      backgroundColor: Colors[scheme].primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: { backgroundColor: Colors[scheme].disabled },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonText: {
      color: Colors[scheme].primaryButtonText,
      fontSize: 16,
      fontWeight: "700",
    },
    // ✅ 테스트 버튼 스타일
    testButton: {
      marginTop: 10,
      padding: 10,
    },
    testButtonText: {
      color: "#8E8E93",
      fontSize: 14,
      textDecorationLine: "underline",
    },
    subTextContainer: {
      marginTop: 12,
      alignItems: "center",
    },
    subText: {
      color: Colors[scheme].subtext || "#8E8E93",
      fontSize: 13,
      fontWeight: "500",
    },
  });

const getMarkdownStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    body: { fontSize: 15, color: Colors[scheme].text, lineHeight: 26 },
    strong: { fontWeight: "700", color: Colors[scheme].text },
    paragraph: { marginBottom: 12, marginTop: 0 },
    list_item: { marginBottom: 8 },
    bullet_list_icon: {
      marginLeft: 4,
      marginRight: 8,
      color: Colors[scheme].icon,
    },
  });
