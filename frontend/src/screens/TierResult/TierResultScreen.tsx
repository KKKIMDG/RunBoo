import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import RunningStatsSummary from "@/components/RunningStatsSummary";

import { styles } from "./TierResult.styles";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BackButton from "@/components/ui/BackButton";

import { TIER_THEMES } from "./TierResult.constants";
import { TIER_IMAGES } from "@/constants/TierImages";
import { useTierResult } from "./useTierResult";

const TierResultScreen = ({ navigation, route }: any) => {
  const colorScheme = useColorScheme() ?? "light";

  const { tierName, tierData, loading, error, handleShare } = useTierResult(
    navigation,
    route
  );

  if (loading) return null;
  if (error || !tierName) return null;

  const theme = TIER_THEMES[tierName];
  const tierImage = TIER_IMAGES[tierName];

  console.log("tierName:", tierName);
  console.log("이미지 경로:", tierImage);

  return (
    <View style={styles.container}>
      {/* 배경 */}
      <LinearGradient colors={theme.colors} style={styles.gradient} />

      <LinearGradient
        colors={["rgba(255,255,255,0.7)", "transparent"]}
        style={styles.shineGradient}
        pointerEvents="none"
      />

      {/* 상단 */}
      <View style={styles.topSection}>
        <View style={[styles.tierLabelBox, { backgroundColor: theme.point }]}>
          <Text style={styles.tierTitle}>티어 측정 결과</Text>
        </View>

        <Text style={styles.tierName}>{theme.label}</Text>

        <View style={styles.ghostContainer}>
          <View style={styles.tierImageGlow} />
          {tierImage && <Image source={tierImage} style={styles.tierImage} />}
        </View>
      </View>

      {/* 하단 */}
      <View style={styles.bottomSheet}>
        <View style={styles.analysisHeader}>
          <View
            style={[styles.checkBadge, { backgroundColor: theme.colors[1] }]}
          >
            <Text style={styles.checkText}>CHECK</Text>
          </View>
          <Text style={styles.analysisTitle}>러닝 측정 분석</Text>
        </View>

        <RunningStatsSummary
          distance={route?.params?.distance}
          time={route?.params?.time}
          pace={route?.params?.pace}
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.shareButton,
              { backgroundColor: theme.colors[1] },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="#FFF" />
            <Text style={[styles.buttonText, styles.whiteText]}>
              기록 자랑하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("MainTabs")}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color={colorScheme === "dark" ? "#FFF" : "#000"}
            />
            <Text style={styles.buttonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TierResultScreen;
