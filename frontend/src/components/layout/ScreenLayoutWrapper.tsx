import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopNavBar, TopNavBarProps } from './TopNavBar';
import { BottomNavBar, BottomNavBarProps } from './BottomNavBar';
import { Colors } from '@/constants/theme';
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

interface ScreenLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showTopNav?: boolean;
  topNavProps?: TopNavBarProps;
  bottomNavProps?: BottomNavBarProps;
}

export function Layout({
  children,
  showBottomNav = true,
  showTopNav = true,
  topNavProps,
  bottomNavProps,
}: ScreenLayoutProps) {
  const { settings } = useSettings();
  const resolvedTheme = useResolvedTheme(settings?.themeMode);
  
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[resolvedTheme].background,
    },
    container: {
      flex: 1,
      backgroundColor: Colors[resolvedTheme].background,
    },
    content: {
      flex: 1,
      paddingBottom: showBottomNav ? Platform.select({
        ios: 75,
        android: 80,
        default: 75,
      }) : 0,
    },
  }), [resolvedTheme, showBottomNav]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {showTopNav && <TopNavBar {...topNavProps} />}
        
        <View style={styles.content}>
          {children}
        </View>

        {showBottomNav && <BottomNavBar {...bottomNavProps} />}
      </View>
    </SafeAreaView>
  );
}
