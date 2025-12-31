import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface TopNavBarProps {
  onLeftPress?: () => void;
  onRightPress?: () => void;
  profileImageUrl?: string | null;
}

export function TopNavBar({
                            onLeftPress,
                            onRightPress,
                            profileImageUrl,
                          }: TopNavBarProps) {
  const [imageLoading, setImageLoading] = useState(false);

  const hasImage = typeof profileImageUrl === "string";

  return (
      <View style={styles.root}>
        {/* 왼쪽 프로필 버튼 */}
        <TouchableOpacity onPress={onLeftPress} activeOpacity={0.7}>
          <View style={styles.profileImageWrapper}>
            {/* 1️이미지가 없으면 무조건 로딩 */}
            {!hasImage && (
                <ActivityIndicator size="small" color="#3A4A98" />
            )}

            {/* 이미지가 있으면 로딩 상태에 따라 처리 */}
            {hasImage && (
                <>
                  {imageLoading && (
                      <ActivityIndicator size="small" color="#3A4A98" />
                  )}
                  <Image
                      source={{ uri: profileImageUrl! }}
                      style={styles.profileImage}
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                  />
                </>
            )}
          </View>
        </TouchableOpacity>

        {/* 중앙 로고 */}
        <View style={styles.logoContainer} pointerEvents="none">
          <Image
              source={require("@/assets/runboo_logo_text.png")}
              style={styles.logoImage}
              resizeMode="contain"
          />
        </View>

        {/* 오른쪽 알림 버튼 */}
        <TouchableOpacity
            style={styles.bellButton}
            onPress={onRightPress}
            activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="notifications-outline" size={22} color="black" />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#F1F3F5",
    borderBottomWidth: 1,
  },

  profileImageWrapper: {
    width: 45,
    height: 45,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E9ECEF",
    zIndex: 10,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  logoContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  logoImage: {
    width: 110,
    height: 30,
  },

  bellButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F1F3F5",
    zIndex: 10,
  },

  iconWrapper: {
    position: "relative",
  },

  dot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
});
