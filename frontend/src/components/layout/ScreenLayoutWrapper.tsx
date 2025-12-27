import React, { ReactNode, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopNavBar, TopNavBarProps } from './TopNavBar';
import { BottomNavBar, BottomNavBarProps } from './BottomNavBar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ScreenLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showTopNav?: boolean;
  topNavProps?: TopNavBarProps;
  bottomNavProps?: BottomNavBarProps;
}

export function ScreenLayout({
  children,
  showBottomNav = true,
  showTopNav = true,
  topNavProps,
  bottomNavProps,
}: ScreenLayoutProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    content: {
      flex: 1,
      paddingBottom: showBottomNav ? Platform.select({
        ios: 75,
        android: 80,
        default: 75,
      }) : 0,
    },
  }), [colorScheme, showBottomNav]);

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
