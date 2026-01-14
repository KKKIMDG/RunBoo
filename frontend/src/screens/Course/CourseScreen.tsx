import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CourseCard from "@/components/CourseCard";
import FilterChip from "@/components/FilterChip";
import { useCourseScreen, FilterType } from "./useCourseScreen";
import { getStyles } from "./CourseScreen.styles";
import { Colors } from "@/constants/theme";
import { useSettings } from "@/screens/Settings/useSettings";

import { useResolvedTheme } from "@/hooks/useResolvedTheme"; // ✅ 테마 해결 훅 import
import { Course } from "@/types/course"; // ✅ 타입 import (donggun 브랜치)

// ✅ 필터 목록 ('내 코스' 추가됨)
const FILTERS: { label: string; type: FilterType }[] = [
  { label: "🔥 인기순", type: "POPULAR" },
  { label: "✨ 최신순", type: "LATEST" },
  { label: "📍 내 주변", type: "NEARBY" },
  { label: "❤ 찜한 코스", type: "SAVED" },
  { label: "👤 내 코스", type: "MY" }, // 👈 추가
];

export default function CourseScreen() {
  const { activeFilter, courses, loading, handlers } = useCourseScreen();
  const { settings } = useSettings();

  // ✅ 테마 및 컬러 설정 (donggun 브랜치 기준 병합)
  const colorScheme = useResolvedTheme(settings?.themeMode);
  const colors = Colors[colorScheme];

  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  const renderItem = ({ item }: { item: Course }) => (
    <View style={{ position: "relative" }}>
      <CourseCard
        course={item}
        onToggle={() => handlers.handleToggleHeart(item.id)}
        onPress={() => handlers.handlePressCard(item)}
        scheme={colorScheme}
      />

      {/* 🔥 [추가] '내 코스' 탭일 때만 삭제 버튼 표시 */}
      {activeFilter === "MY" && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(0,0,0,0.6)", // 반투명 검정 배경
            borderRadius: 20,
            padding: 6,
            zIndex: 10,
          }}
          onPress={() => handlers.handleDeleteCourse(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#FF5252" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.mainHeader}>코스 추천</Text>
          <Text style={styles.subHeader}>나에게 맞는 러닝 코스</Text>
        </View>
      </View>

      {/* 필터 칩 */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.type}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              isActive={activeFilter === item.type}
              onPress={() => handlers.handleFilterChange(item.type)}
              scheme={colorScheme}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      </View>

      {/* 리스트 */}
      {loading && courses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.icon, fontSize: 14 }}>
            불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                {activeFilter === "MY"
                  ? "아직 등록한 코스가 없습니다.\n나만의 러닝 코스를 공유해보세요! 🚩"
                  : "코스가 없습니다."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
