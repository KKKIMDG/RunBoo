// src/components/tutorial/TutorialProvider.tsx

import React from "react";
import { CopilotProvider } from "react-native-copilot";
import { StyleSheet, View, Text } from "react-native";

interface TutorialProviderProps {
  children: React.ReactNode;
}

/**
 * 앱 전체를 감싸는 튜토리얼 Provider
 * react-native-copilot의 CopilotProvider를 래핑
 */
export function TutorialProvider({ children }: TutorialProviderProps) {
  return (
    <CopilotProvider
      // 툴팁 스타일 커스터마이징
      tooltipStyle={{
        backgroundColor: "#000",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
      }}
      arrowColor="#000"
      // 오버레이 색상
      overlay="svg"
      androidStatusBarVisible
      // 애니메이션
      animated
      // 백드롭 투명도
      backdropColor="rgba(0, 0, 0, 0.8)"
      // 다음/이전/건너뛰기 버튼 라벨
      labels={{
        skip: "건너뛰기",
        next: "다음",
        previous: "이전",
        finish: "완료",
      }}
    >
      {children}
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 16,
  },
});
