import { Dimensions, StyleSheet, Platform } from "react-native";
import { Colors, FontSizes } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
        },
        scrollContainer: {
            padding: 20,
            alignItems: "center",
        },

        // --- 상단 프로필 영역 ---
        profileContainer: {
            alignItems: "center",
            marginTop: 20,
            marginBottom: 30,
        },
        profileImageContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors[scheme].background,
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
            fontSize: 24,
            fontWeight: "bold",
            color: Colors[scheme].text,
            marginBottom: 5,
        },
        subtitleText: {
            fontSize: 16,
            color: Colors[scheme].subtext,
            fontWeight: "600",
        },

        // --- 요약 통계 영역 ---
        summaryContainer: {
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            marginBottom: 25,
            marginTop: 10,
            marginLeft: 6,
        },
        summaryItem: {
            alignItems: "center",
        },
        summaryLabel: {
            fontSize: 14,
            color: Colors[scheme].subtext,
            marginTop: 8,
            marginBottom: 4,
        },
        summaryValue: {
            fontSize: 24,
            fontWeight: "bold",
            color: Colors[scheme].text,
            fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        },
        summaryUnit: {
            fontSize: 12,
            color: Colors[scheme].subtext,
        },

        // --- 지도 영역 ---
        mapContainer: {
            width: width - 40,
            height: width - 40,
            backgroundColor: Colors[scheme].secondaryBackground,
            borderRadius: 20,
            overflow: "hidden",
            marginBottom: 30,
            justifyContent: "center",
            alignItems: "center",
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 5 },
                },
                android: { elevation: 5 },
            }),
        },
        map: {
            ...StyleSheet.absoluteFillObject,
        },
        mapPlaceholderText: {
            color: Colors[scheme].subtext,
            fontSize: 16,
        },
        logoContainer: {
            position: "absolute",
            bottom: 15,
            right: 15,
        },
        logoImage: {
            width: 40,
            height: 40,
            resizeMode: "contain",
        },

        // --- 버튼 ---
        buttonContainer: {
            width: "100%",
            marginBottom: 30,
            marginTop: 20,
        },
        shareButton: {
            backgroundColor: Colors[scheme].primary,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 18,
            borderRadius: 30,
            marginBottom: 15,
        },
        shareButtonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "bold",
            marginLeft: 10,
        },
        homeButton: {
            backgroundColor: Colors[scheme].card,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 18,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: scheme === "dark" ? "#333" : "#E0E0E0",
        },
        homeButtonText: {
            color: Colors[scheme].text,
            fontSize: 16,
            fontWeight: "bold",
            marginLeft: 10,
        },

        /* =========================
           ✅ 하단 3개 카드(칼로리/평균 속도/케이던스) 비율 수정
           - 기존: 2개 기준 width: (width - 60) / 2
           - 수정: 3개 기준으로 gap까지 고려해 정확히 3등분
        ========================= */
        bottomInfoContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 6,
        },
        bottomInfoCard: {
            backgroundColor: Colors[scheme].card,

            // ✅ 핵심: 3개 카드가 정확히 들어가도록 계산
            // 컨테이너 내부 실가용 폭: (width - 40)  // mapContainer와 동일 기준
            // 카드 간 간격 2개를 12px로 가정 -> 24px 빼고 3등분
            width: Math.floor((width - 40 - 24) / 3),

            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 15,

            // 카드 높이 균일감
            alignItems: "flex-start",
        },
        bottomInfoLabel: {
            fontSize: 13,
            color: Colors[scheme].subtext,
            marginBottom: 8,
            fontWeight: "600",
        },
        bottomInfoValue: {
            fontSize: 18,
            fontWeight: "bold",
            color: Colors[scheme].text,
            fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        },

        icon: {
            fontSize: 28,
            color: Colors[scheme].icon,
        },
    });
