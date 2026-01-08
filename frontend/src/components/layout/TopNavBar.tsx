import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserMe } from "@/contexts/UserMeContext";

import { useFonts, FugazOne_400Regular } from "@expo-google-fonts/fugaz-one";

export interface TopNavBarProps {
    onLeftPress?: () => void;
    onRightPress?: () => void;
}

export function TopNavBar({
                              onLeftPress,
                              onRightPress,
                          }: TopNavBarProps) {
    const { userMe } = useUserMe();
    const [imageLoading, setImageLoading] = useState(false);

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
                    <Ionicons name="notifications-outline" size={22} color="#000" />
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

    logoText: {
        fontFamily: "FugazOne_400Regular",
        fontSize: 24,
        letterSpacing: 0.8,
        color: "#000",
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
