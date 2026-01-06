import React, {useEffect, useState} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserMe } from "@/contexts/UserMeContext";

export interface TopNavBarProps {
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function TopNavBar({
                            onLeftPress,
                            onRightPress,
                          }: TopNavBarProps) {
  const { userMe } = useUserMe(); // ✅ loading 제거
  const [imageLoading, setImageLoading] = useState(false);

  const profileImageSource =
      typeof userMe?.profileImageUrl === "string" &&
      userMe.profileImageUrl.length > 0
          ? { uri: userMe.profileImageUrl }
          : require("@/assets/images/runboo.png");

  // 이미지 소스가 바뀌면 로딩 상태 초기화
  useEffect(() => {
    setImageLoading(false);
  }, [profileImageSource]);

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
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
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
