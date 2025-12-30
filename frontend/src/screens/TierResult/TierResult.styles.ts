import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  shineGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  tierImageGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 1,
  },
  tierImage: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    zIndex: 2,
  },
  // 상단 섹션
  topSection: {
    height: 452,
    alignItems: "center",
    paddingTop: 60,
    zIndex: 10,
    marginTop: 20,
  },
  tierLabelBox: {
    backgroundColor: "#d0d0d0",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tierTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFF",
  },
  tierName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#000",
    marginTop: 15,
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  ghostContainer: {
    position: "absolute",
    top: 175,
    width: 241,
    height: 241,
    borderRadius: 120.5,
    backgroundColor: "rgba(224, 231, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  // 하단 리포트 시트
  bottomSheet: {
    position: "absolute",
    top: 452,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F9F9F9",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    paddingTop: 40,
    paddingHorizontal: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 15,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  checkText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  // 통계 그리드
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  statUnit: {
    fontSize: 11,
    color: "#AAA",
    fontWeight: "600",
  },
  paceValue: {
    color: "#2e3d6e",
  },
  // 버튼 그룹
  buttonGroup: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 40,
    // ✅ 양옆 여백을 추가해서 버튼 넓이를 자연스럽게 줄입니다.
    paddingHorizontal: 24,
    alignItems: "center", // 내부 버튼들 중앙 정렬
  },
  button: {
    // 이제 buttonGroup의 패딩을 제외한 나머지 100%를 차지하게 됩니다.
    width: "100%",
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,

    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "#FFF",

    // 그림자 추가 (선택 사항)
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shareButton: {
    backgroundColor: "#000",

    borderWidth: 0,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,

    elevation: 12,
  },
  homeButton: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E9ECEF",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
  },
  whiteText: {
    color: "#FFF",
  },
  blackText: {
    color: "#000",
  },
});
