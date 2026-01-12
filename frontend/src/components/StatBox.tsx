import React, { useMemo } from "react";
import { View, Text, useColorScheme } from "react-native"; // ✅ useColorScheme 추가
import { getStyles } from "../screens/running/RunningScreen.styles"; // ✅ getStyles로 변경

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}

export function StatBox({ icon, label, value, unit, highlight }: StatBoxProps) {
  // ✅ 다크모드 감지 및 스타일 생성
  const colorScheme = useColorScheme() ?? "light";

  const styles = useMemo(() => {
    return getStyles(colorScheme);
  }, [colorScheme]);

  return (
    <View style={styles.statBox}>
      {/* 상단: 아이콘 + 라벨 */}
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>

      {/* 하단: 값 + 단위 */}
      <View style={styles.statValueContainer}>
        <Text
          style={[styles.statValue, highlight && styles.statValueHighlight]}
        >
          {value}
        </Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
    </View>
  );
}
