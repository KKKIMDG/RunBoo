// screens/records/components/AiAnalysisCard.tsx

import React, { useMemo, useState } from "react";
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
import { fetchMonthlyAnalysis } from "@/services/record/recordsService";
import Markdown from "react-native-markdown-display";
import { Colors } from "@/constants/theme";

export default function AiAnalysisCard() {
    const colorScheme = useColorScheme() ?? "light";

    const styles = useMemo(() => {
        return getStyles(colorScheme);
    }, [colorScheme]);

    const markdownStyles = useMemo(() => {
        return getMarkdownStyles(colorScheme);
    }, [colorScheme]);

    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        try {
            setLoading(true);
            const result = await fetchMonthlyAnalysis();
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            Alert.alert(
                "분석 실패",
                "AI 분석을 불러오지 못했어요. 잠시 후 다시 시도해주세요."
            );
        } finally {
            setLoading(false);
        }
    };

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

            {/* 3. 하단 버튼 */}
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleAnalyze}
                disabled={loading}
                activeOpacity={0.85}
            >
                <Text style={styles.buttonText}>
                    {loading
                        ? "분석중..."
                        : analysisResult
                            ? "다시 분석하기"
                            : "AI 분석 시작"}
                </Text>
            </TouchableOpacity>
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
        title: {
            fontSize: 18,
            fontWeight: "700",
            color: Colors[scheme].text,
        },
        contentContainer: {
            backgroundColor: Colors[scheme].card,
            borderRadius: 16,
            padding: 20,
            minHeight: 140,
            justifyContent: "center",
            marginBottom: 16,

            shadowColor: Colors[scheme].shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        centerBox: {
            alignItems: "center",
            justifyContent: "center",
        },
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
        button: {
            backgroundColor: Colors[scheme].primary,
            borderRadius: 14,
            paddingVertical: 18,
            alignItems: "center",
            justifyContent: "center",
        },
        buttonDisabled: {
            backgroundColor: Colors[scheme].disabled,
        },
        buttonText: {
            color: Colors[scheme].primaryButtonText,
            fontSize: 16,
            fontWeight: "700",
        },
    });

const getMarkdownStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        body: {
            fontSize: 15,
            color: Colors[scheme].text,
            lineHeight: 26,
        },
        strong: {
            fontWeight: "700",
            color: Colors[scheme].text,
        },
        paragraph: {
            marginBottom: 12,
            marginTop: 0,
        },
        list_item: {
            marginBottom: 8,
        },
        bullet_list_icon: {
            marginLeft: 4,
            marginRight: 8,
            color: Colors[scheme].icon,
        },
    });
