import React, { useState, useEffect, ReactNode } from "react";
import {
  View,
  AppState,
  Platform,
  Text,
  Button,
  Linking,
  StyleSheet,
  ColorSchemeName,
} from "react-native";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const getStyles = (scheme: ColorSchemeName) => {
  const colors = Colors[scheme];
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 16,
    },
    message: {
      color: colors.text,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 24,
    },
    buttonWrapper: {
      width: "80%",
      marginTop: 20,
    },
  });
};

interface PermissionGuardProps {
  children: ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const scheme = useColorScheme();
  const styles = getStyles(scheme);
  const colors = Colors[scheme];

  const checkAndRequestPermissions = async () => {
    setIsChecking(true);

    // 1. Location
    let bgStatus = await Location.getBackgroundPermissionsAsync();
    if (bgStatus.status !== "granted") {
      let fgStatus = await Location.getForegroundPermissionsAsync();
      if (fgStatus.status !== "granted") {
        fgStatus = await Location.requestForegroundPermissionsAsync();
      }
      if (fgStatus.status === "granted") {
        bgStatus = await Location.requestBackgroundPermissionsAsync();
      }
    }

    // 2. Activity Recognition (Android only)
    let activityStatusGranted = true;
    if (Platform.OS === "android") {
      const pedometerAvailable = await Pedometer.isAvailableAsync();
      if (pedometerAvailable) {
        let activityStatus = await Pedometer.getPermissionsAsync();
        if (activityStatus.status !== "granted") {
          activityStatus = await Pedometer.requestPermissionsAsync();
        }
        activityStatusGranted = activityStatus.status === "granted";
      }
    }
    
    const allGranted = Platform.OS === 'ios' 
      ? bgStatus.status === 'granted'
      : bgStatus.status === 'granted' && activityStatusGranted;

    setPermissionsGranted(allGranted);
    setIsChecking(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        checkAndRequestPermissions();
      }
      setAppState(nextAppState);
    });

    checkAndRequestPermissions();

    return () => {
      subscription.remove();
    };
  }, [appState]);

  if (isChecking) {
    return <View style={styles.container} />; // Loading screen
  }

  if (!permissionsGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>권한 필요</Text>
        <Text style={styles.message}>
          앱을 사용하려면 위치 및 신체 활동 권한이 반드시 필요합니다.
        </Text>
        <View style={styles.buttonWrapper}>
          <Button
            title="권한 설정으로 이동"
            onPress={() => Linking.openSettings()}
            color={colors.primary}
          />
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
