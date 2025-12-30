import React from "react";
import { View, Text, StyleSheet, ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RunningStatsSummaryProps {
  distance: string | number;
  time: string;
  pace: string;
  textColor?: ColorValue;
}

const RunningStatsSummary = ({
  distance,
  time,
  pace,
  textColor = "#333",
}: RunningStatsSummaryProps) => {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statItem}>
        <Ionicons name="map-outline" size={20} color="#999" />
        <Text style={styles.statLabel}>거리</Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {distance ?? "-"} km
        </Text>
      </View>

      <View style={styles.statItem}>
        <Ionicons name="time-outline" size={20} color="#999" />
        <Text style={styles.statLabel}>시간</Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {time ?? "-"}
        </Text>
      </View>

      <View style={styles.statItem}>
        <Ionicons name="speedometer-outline" size={20} color="#999" />
        <Text style={styles.statLabel}>페이스</Text>
        <Text style={[styles.statValue, { color: textColor }]}>
          {pace ?? "-"} /km
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    // ✅ 바텀시트 배경색(#F9F9F9)과 동일하게 설정하여 경계를 없앱니다.
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    // ✅ 카드처럼 보이지 않도록 모든 그림자 및 입체감(elevation)을 제거합니다.
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    width: "100%", // 너비를 꽉 채워 배치
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
});

export default RunningStatsSummary;
