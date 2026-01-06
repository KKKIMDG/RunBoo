
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 (없으면 빼셔도 됩니다)
import { fetchMonthlyAnalysis } from "@/services/record/recordsService";

export default function AiAnalysisCard() {
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        try {
            setLoading(true);
            const result = await fetchMonthlyAnalysis();
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            Alert.alert("분석 실패", "AI 분석을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* 1. 헤더 (아이콘 + 제목) */}
            <View style={styles.header}>
                <Ionicons name="ribbon-outline" size={20} color="#333" style={{ marginRight: 6 }} />
                <Text style={styles.title}>분석 리포트</Text>
            </View>

            {/* 2. 컨텐츠 영역 (결과 텍스트 or 플레이스홀더) */}
            <View style={styles.contentContainer}>
                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text style={styles.loadingText}>결과 분석중...</Text>
                    </View>
                ) : analysisResult ? (
                    <Text style={styles.resultText}>{analysisResult}</Text>
                ) : (
                    <View style={styles.centerBox}>
                        <Text style={styles.placeholderText}>
                            이번 달 러닝 기록을 AI가 분석해드려요!{"\n"}
                            아래 버튼을 눌러보세요.
                        </Text>
                    </View>
                )}
            </View>

            {/* 3. 하단 버튼 */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleAnalyze}
                disabled={loading}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    {loading ? "분석중..." : (analysisResult ? "다시 분석하기" : "Ai 분석")}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginVertical: 10,
        // 그림자 효과 (카드 느낌)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
    },
    contentContainer: {
        minHeight: 120, // 높이 확보
        backgroundColor: "#F8F9FA", // 살짝 회색 배경 (스크린샷 점선 박스 느낌 대체)
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        justifyContent: "center",
    },
    centerBox: {
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: "#666",
    },
    placeholderText: {
        textAlign: "center",
        color: "#888",
        fontSize: 14,
        lineHeight: 20,
    },
    resultText: {
        fontSize: 15,
        color: "#333",
        lineHeight: 24,
    },
    button: {
        backgroundColor: "#000", // 스크린샷의 검은 버튼
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});