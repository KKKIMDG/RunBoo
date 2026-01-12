import React, { useState, useEffect, ReactNode } from "react";
import { View, Text, TouchableOpacity, Platform, Linking } from "react-native";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import * as Notifications from "expo-notifications";

interface PermissionGuardProps {
  children: ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  const [granted, setGranted] = useState<boolean | null>(null);

  const requestAll = async () => {
    try {
      // 1️⃣ 위치 권한 요청 (Foreground → Background)
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") return setGranted(false);

      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      if (bg !== "granted") return setGranted(false);

      // 2️⃣ 신체 활동/모션 권한 요청 (iOS/Android)
      const pedometerStatus = await Pedometer.requestPermissionsAsync();
      if (pedometerStatus.status !== "granted") return setGranted(false);

      // 3️⃣ 알림 권한 요청 (iOS/Android) → 거부해도 OK
      try {
        await Notifications.requestPermissionsAsync();
      } catch (e) {
        console.warn("알림 권한 요청 실패, 무시하고 계속 진행");
      }

      setGranted(true);
    } catch (e) {
      setGranted(false);
    }
  };

  const openSettings = () => {
    // 시스템 설정 앱 열기
    Linking.openSettings().catch(() => {
      console.warn("Unable to open settings");
    });
  };

  useEffect(() => {
    requestAll();
  }, []);

  if (granted === null) return null;

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
          onPress={openSettings} // ✅ 설정으로 안내
          style={{ marginTop: 20, padding: 10, backgroundColor: "#000" }}
        >
          <Text style={{ color: "#fff" }}>권한 설정 열기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
