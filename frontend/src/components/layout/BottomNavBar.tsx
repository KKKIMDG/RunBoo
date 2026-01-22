import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { getStyles } from "./BottomNavBar.styles";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomNavBarProps {
  activeTab?: string;
  onTabPress?: (tabName: string) => void;
}

/**
 * Ionicons name 타입을 정확히 추출
 */
type IoniconName = ComponentProps<typeof Ionicons>["name"];

export function BottomNavBar({
  activeTab = "홈",
  onTabPress,
}: BottomNavBarProps) {

  const { settings } = useSettings();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(resolvedTheme, settings?.fontSize || "MEDIUM");
  }, [resolvedTheme, settings?.fontSize]);
  const insets = useSafeAreaInsets();
  const tabs: {
    name: string;
    icon: IoniconName;
    outline: IoniconName;
  }[] = [
    { name: "홈", icon: "home", outline: "home-outline" },
    { name: "코스", icon: "map", outline: "map-outline" },
    { name: "도전", icon: "trophy", outline: "trophy-outline" },
    { name: "친구", icon: "people", outline: "people-outline" },
    { name: "통계", icon: "stats-chart", outline: "stats-chart-outline" },
  ];

  return (
    <View style={[styles.root,
      Platform.OS === "android" && {
        paddingBottom: insets.bottom,
        height: 70 + insets.bottom,
      },
    ]}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.button}
              onPress={() => onTabPress?.(tab.name)}
              activeOpacity={0.7}
            >
              {isActive && <View style={styles.activeBar} />}

              <Ionicons
                name={isActive ? tab.icon : tab.outline}
                size={24}
                color={
                  isActive ? styles.activeText.color : styles.inactiveText.color
                }
              />

              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
