import React, {useMemo} from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  Image, // 아이콘 이미지 출력을 위해 추가
  ActivityIndicator, // 로딩 표시를 위해 추가
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { getStyles } from "./BadgeCollection.styles";
import { useBadge } from "@/screens/Badge/useBadge"; // 만든 훅 임포트
import { UserBadgeDto } from "@/types/badge";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

export default function BadgeCollectionModal({ navigation }: any) {
    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

  // useBadge 훅을 통해 서버 데이터를 가져옵니다 (유저 ID 1번 고정)
    const { badges, loading, badgeCount } = useBadge();

  // 개별 배지 아이템 렌더링
    const renderBadgeItem = ({ item }: { item: UserBadgeDto }) => {
        const badge = item.badge;

        return (
            <View style={styles.badgeItem}>
                <View style={styles.badgeIconContainer}>
                    <Image
                        source={{ uri: badge.iconUrl }}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.badgeName}>{badge.name}</Text>

                {/* 획득 날짜 */}
                <Text style={styles.badgeDate}>
                    {new Date(item.acquiredAt).toLocaleDateString()}
                </Text>
            </View>
        );
    };

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        <View style={styles.indicator} />

        <View style={styles.header}>
          {/* [API 연동] 전체 획득 개수를 동적으로 표시 */}
          <Text style={styles.headerTitle}>배지 보관함 ({badgeCount})</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          // 로딩 중일 때 표시
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#3A4A98" />
          </View>
        ) : (
          <FlatList
            /* [API 연동] 서버에서 받아온 실제 배지 배열 연결 */
              data={badges}
              keyExtractor={(item) => item.userBadgeId.toString()}
              renderItem={renderBadgeItem}
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
