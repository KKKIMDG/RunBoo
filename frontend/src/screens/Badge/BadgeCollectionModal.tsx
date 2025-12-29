// src/screens/Profile/BadgeCollectionModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getStyles } from "./BadgeCollection.styles";

/** * [API 연동 포인트 1]
 * 현재는 파일 내부에 고정된 더미 데이터를 사용 중입니다.
 * 나중에 이 부분은 삭제하고, 서버에서 받아온 유저의 '획득한 배지 리스트'를
 * useBadge(가칭) 같은 커스텀 훅이나 서버 상태 관리(React Query 등)를 통해 가져와야 합니다.
 */
const ACQUIRED_BADGES = [
  { id: "1", name: "첫 걸음", date: "2024.10.01", icon: "footsteps" },
  { id: "2", name: "아침형 인간", date: "2024.10.15", icon: "sunny" },
  { id: "3", name: "10KM 마스터", date: "2024.11.20", icon: "trophy" },
  { id: "4", name: "꾸준함의 미학", date: "2024.12.01", icon: "flame" },
  { id: "5", name: "스피드 왕", date: "2024.12.25", icon: "flash" },
];

export default function BadgeCollectionModal({ navigation }: any) {
  const colorScheme = useColorScheme() ?? "light";
  const styles = getStyles(colorScheme);

  const renderBadgeItem = ({ item }: any) => (
    <View style={styles.badgeItem}>
      <View style={styles.badgeIconContainer}>
        {/* [API 연동 포인트 2] 
          서버에서 'footsteps' 같은 아이콘 문자열을 줄 수도 있고, 이미지 URL을 줄 수도 있습니다.
          1. 문자열일 경우: 현재처럼 Ionicons name에 매핑
          2. URL일 경우: <Image source={{ uri: item.imageUrl }} /> 로 변경 필요
        */}
        <Ionicons name={item.icon} size={32} color="#3A4A98" />
      </View>

      {/* [API 연동 포인트 3] 배지 명칭 (item.name) */}
      <Text style={styles.badgeName}>{item.name}</Text>

      {/* [API 연동 포인트 4] 획득 날짜 (item.date)
        서버에서는 보통 ISO 형식(2025-12-29T...)으로 내려옵니다. 
        화면에 보여주기 전 'yyyy.MM.dd' 형식으로 변환하는 라이브러리(date-fns 등) 처리가 필요할 수 있습니다.
      */}
      <Text style={styles.badgeDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        <View style={styles.indicator} />

        <View style={styles.header}>
          {/* [API 연동 포인트 5] 
            헤더에 전체 획득 개수를 표시하고 싶다면 '획득한 배지 ({ACQUIRED_BADGES.length})' 
            와 같이 동적으로 처리할 수 있습니다.
          */}
          <Text style={styles.headerTitle}>배지 보관함</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
        </View>

        <FlatList
          /* [API 연동 포인트 6] data 속성에 서버에서 받아온 실제 State(상태) 데이터 연결 */
          data={ACQUIRED_BADGES}
          renderItem={renderBadgeItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            /* [API 연동 포인트 7] 데이터 로딩 중이 아님에도 데이터가 0개일 때만 노출 */
            <Text style={styles.emptyText}>아직 획득한 배지가 없습니다.</Text>
          }
        />
      </View>
    </View>
  );
}
