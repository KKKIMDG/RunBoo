import React, {ReactNode, useMemo} from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";
import {useSettings} from "@/screens/Settings/useSettings";

interface ScreenLayoutProps {
  title: string;
  subtitle: string;
  loading?: boolean;
  children: ReactNode;
}

// 스타일을 생성하는 함수를 만듭니다.
const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 14,
      backgroundColor: Colors[scheme].background, // 테마에 맞는 배경색 사용
    },
    title: {
      fontSize: scaleFont(22, fontSize),
      fontWeight: "900",
      color: Colors[scheme].text, // 테마에 맞는 텍스트 색상 사용
    },
    subTitle: {
      marginTop: 4,
      color: Colors[scheme].icon, // 아이콘/보조 텍스트 색상 사용
      fontWeight: "600",
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[scheme].background, // 테마에 맞는 배경색 사용
    },
  });

export default function ScreenLayout({
  title,
  subtitle,
  loading,
  children,
}: ScreenLayoutProps) {
    const { settings } = useSettings();
    const resolvedTheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(resolvedTheme, settings?.fontSize || "MEDIUM");
    }, [resolvedTheme, settings?.fontSize]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors[resolvedTheme].tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subTitle}>{subtitle}</Text>
      {children}
    </View>
  );
}
