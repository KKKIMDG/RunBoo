import React from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  Image, // ✅ 아이콘 이미지 출력을 위해 추가
  ActivityIndicator, // ✅ 로딩 표시를 위해 추가
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getStyles } from "./BadgeCollection.styles";
import { useBadge } from "@/screens/Badge/useBadge"; // ✅ 만든 훅 임포트
import { BadgeDto } from "@/types/badge"; // ✅ 타입 임포트

export default function BadgeCollectionModal({ navigation }: any) {
  const colorScheme = useColorScheme() ?? "light";
  const styles = getStyles(colorScheme);

  // ✅ useBadge 훅을 통해 서버 데이터를 가져옵니다 (유저 ID 1번 고정)
  const { badges, loading, badgeCount } = useBadge(1);

  // 개별 배지 아이템 렌더링
  const renderBadgeItem = ({ item }: { item: BadgeDto }) => (
    <View style={styles.badgeItem}>
      <View style={styles.badgeIconContainer}>
        {/* ✅ [API 연동] 서버에서 준 iconUrl을 이미지로 출력합니다 */}
        <Image
          source={{ uri: item.iconUrl }}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
          // 이미지 로딩 실패 시 보여줄 기본 아이콘 처리 가능
        />
      </View>

      {/* ✅ [API 연동] 배지 명칭 적용 */}
      <Text style={styles.badgeName}>{item.name}</Text>

      {/* ✅ [API 연동] 획득 날짜 (현재 서버 응답에 날짜 정보가 없다면 설명이나 난이도 등으로 대체 가능) */}
      <Text style={styles.badgeDate}>{item.difficulty}</Text>
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
          {/* ✅ [API 연동] 전체 획득 개수를 동적으로 표시 */}
          <Text style={styles.headerTitle}>배지 보관함 ({badgeCount})</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          // ✅ 로딩 중일 때 표시
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#3A4A98" />
          </View>
        ) : (
          <FlatList
            /* ✅ [API 연동] 서버에서 받아온 실제 배지 배열 연결 */
            data={badges}
            renderItem={renderBadgeItem}
            keyExtractor={(item) => item.badgeId.toString()} // ✅ badgeId 사용
            numColumns={3}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>아직 획득한 배지가 없습니다.</Text>
            }
          />
        )}
      </View>
    </View>
  );
}
