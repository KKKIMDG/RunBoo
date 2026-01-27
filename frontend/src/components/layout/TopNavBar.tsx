import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserMe } from "@/contexts/UserMeContext";
import { getStyles } from "@/components/layout/TopNavBar.styles";
import { useMemo } from "react";

import { useFonts, FugazOne_400Regular } from "@expo-google-fonts/fugaz-one";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";
import {useSettings} from "@/screens/Settings/useSettings";

export interface TopNavBarProps {
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function TopNavBar({ onLeftPress, onRightPress }: TopNavBarProps) {
  const { userMe } = useUserMe();
  const [imageLoading, setImageLoading] = useState(false);
  const { hasUnread } = useUnreadNotifications();

  const { settings } = useSettings();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(resolvedTheme, settings?.fontSize || "MEDIUM");
  }, [resolvedTheme, settings?.fontSize]);

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
  const isRemoteImage =
      typeof profileImageSource === "object" &&
      profileImageSource !== null &&
      "uri" in profileImageSource;

  return (
    <View style={styles.root}>
      {/* 왼쪽 프로필 버튼 */}
      <TouchableOpacity onPress={onLeftPress} activeOpacity={0.7}>
      <View style={styles.profileImageWrapper}>
        <Image
            source={profileImageSource}
            style={styles.profileImage}
            resizeMode="cover"
            onLoadStart={() => {
              if (isRemoteImage) {
                setImageLoading(true);
              }
            }}
            onLoadEnd={() => {
              if (isRemoteImage) {
                setImageLoading(false);
              }
            }}
            onError={() => {
              if (isRemoteImage) {
                setImageLoading(false);
              }
            }}
        />

        {isRemoteImage && imageLoading && (
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
          {hasUnread && <View style={styles.dot} />}
        </View>
      </TouchableOpacity>
    </View>
  );
}
