import React, { useState, useEffect, ReactNode } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";

interface PermissionGuardProps {
  children: ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const [granted, setGranted] = useState<boolean | null>(null);

  const requestAll = async () => {
    try {
      // 1. 위치 권한 요청 (앱 사용 중 -> 항상 허용 순차 진행)
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") return setGranted(false);

      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== "granted") return setGranted(false);

      // 2. 신체 활동 권한 요청 (안드로이드)
      if (Platform.OS === "android") {
        const { status: act } = await Pedometer.requestPermissionsAsync();
        if (act !== "granted") return setGranted(false);
      }

      setGranted(true);
    } catch (e) {
      setGranted(false);
    }
  };

  useEffect(() => {
    requestAll();
  }, []);

  if (granted === null) return null; // 로딩 중

  if (granted === false) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          권한이 필요합니다
        </Text>
        <Text style={{ marginVertical: 10, textAlign: "center" }}>
          러닝 기록을 위해 위치(항상 허용)와 신체 활동 권한이 필요합니다.
        </Text>
        <TouchableOpacity
          onPress={requestAll}
          style={{ marginTop: 20, padding: 10, backgroundColor: "#000" }}
        >
          <Text style={{ color: "#fff" }}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
