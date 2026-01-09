import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Text,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserMe } from "@/contexts/UserMeContext";
import { getStyles } from "@/components/layout/TopNavBar.styles";
import { useMemo } from "react";

import { useFonts, FugazOne_400Regular } from "@expo-google-fonts/fugaz-one";

export interface TopNavBarProps {
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function TopNavBar({ onLeftPress, onRightPress }: TopNavBarProps) {
  const { userMe } = useUserMe();
  const [imageLoading, setImageLoading] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  const styles = useMemo(() => {
    return getStyles(colorScheme);
  }, [colorScheme]);

  const [fontsLoaded] = useFonts({
    FugazOne_400Regular,
  });

  const profileImageSource =
    typeof userMe?.profileImageUrl === "string" &&
    userMe.profileImageUrl.length > 0
      ? { uri: userMe.profileImageUrl }
      : require("@/assets/images/runboo.png");

  useEffect(() => {
    setImageLoading(false);
  }, [profileImageSource]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, { justifyContent: "center" }]}>
        <ActivityIndicator size="small" color="#3A4A98" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* 왼쪽 프로필 버튼 */}
      <TouchableOpacity onPress={onLeftPress} activeOpacity={0.7}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={profileImageSource}
            style={styles.profileImage}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />

          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#3A4A98" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* 중앙 RunBoo 텍스트 로고 */}
      <View style={styles.logoContainer} pointerEvents="none">
        <Text style={styles.logoText}>RunBoo</Text>
      </View>

      {/* 오른쪽 알림 버튼 */}
      <TouchableOpacity
        style={styles.bellButton}
        onPress={onRightPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="notifications-outline" style={styles.icon} />
          <View style={styles.dot} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
