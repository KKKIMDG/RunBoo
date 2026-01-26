// src/screens/tutorial/OnboardingScreen.tsx

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useTutorial } from "@/hooks/useTutorial";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string | any; // 이모지(string) 또는 이미지 소스(require)
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "RunBoo! 러닝의 새로운 친구",
    description: "당신의 러닝을 더욱 재미있게 만들어줄 앱입니다",
    icon: require("@/assets/phone0.png"),
  },
  {
    id: "2",
    title: "3가지 모드로 즐기는 러닝",
    description: "일반러닝, 티어측정, 고스트모드 중에서 선택하세요",
    icon: require("@/assets/phone1.png"),
  },
  {
    id: "3",
    title: "시즌별 도전과제에 도전하세요",
    description: "다양한 도전과제를 통해 러닝의 즐거움을 더해보세요",
    icon: require("@/assets/phone2.png"),
  },
  {
    id: "4",
    title: "주변 러너와 함께 달려요",
    description: "내 주변 러너를 확인하고 기록을 뛰어넘어봐요",
    icon: require("@/assets/phone3.png"),
  },
  {
    id: "5",
    title: "기록을 분석해주는 Ai 코치",
    description: "자신의 기록으로 피드백을 받아보세요",
    icon: require("@/assets/phone4.png"),
  },
];

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const { completeOnboarding } = useTutorial();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleStart = () => {
    // 마지막 슬라이드에서 시작하기 버튼 클릭
    completeOnboarding();
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    if (onComplete) {
      onComplete();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    // 이미지인지 이모지인지 판단 (typeof로 체크)
    const isImageSource = typeof item.icon !== "string";

    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          {isImageSource ? (
            <Image
              source={item.icon}
              style={styles.iconImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.icon}>{item.icon}</Text>
          )}
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 건너뛰기 버튼 */}
      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      {/* 슬라이드 */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentIndex(index);
        }}
        scrollEnabled={true} // 좌우 스와이프 자유롭게
      />

      {/* 페이지 인디케이터 */}
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* 마지막 페이지에만 시작하기 버튼 */}
      {currentIndex === SLIDES.length - 1 && (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: "#888",
    fontSize: 16,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  icon: {
    fontSize: 100,
  },
  iconImage: {
    width: 500,
    height: 500,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  dotInactive: {
    backgroundColor: "#555",
  },
  startButton: {
    position: "absolute",
    bottom: 50,
    left: 40,
    right: 40,
    backgroundColor: "#3A4A98",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
