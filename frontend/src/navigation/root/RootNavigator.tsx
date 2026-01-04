import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";

import AuthStack from "../auth/AuthStack";
import MainStack from "@/navigation/stacks/MainStack";

import RunningScreen from "@/screens/running"; // 일반 러닝
import TierRunningScreen from "@/screens/running/TierRunningScreen"; // ✅ 티어 전용 러닝 추가
import RunResultScreen from "@/screens/RunResult";
import GhostRunScreen from "@/screens/ghost/GhostRunScreen";
import MapFullScreen from "@/screens/Home/MapFullScreen";
import TierResultScreen from "@/screens/TierResult/TierResultScreen";

import { Coordinate } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";

export type RootStackParamList = {
  MainStack: undefined;
  Running: { userId: number; targetDistance: number; mode?: "NORMAL" };
  TierRunning: {
    userId?: number;
    targetDistance: number;
    mode?: "TIER";
    distanceType?: "5km" | "10km";
  };
  GhostRun: { ghost: GhostProfileDto };
  RunResult: {
    distanceM: number;
    durationSec: number;
    avgPaceSec: number;
    calories: number;
    routeCoordinates: Coordinate[];
  };
  TierResult: {
    // ✅ 로직 필수 파라미터
    userId?: number;
    recordId: number;
    distanceType: "5k" | "10k";
    achievedTier: string;
    isStopped?: boolean; // ✅ 측정 중단 여부 파라미터 추가

    // ✅ 화면 표시용 및 원본 데이터
    stats: {
      distance: string;
      time: string;
      pace: string;
    };
    distanceM: number;
    durationSec: number;
    avgPaceSec: number;
    calories: number;
    routeCoordinates: Coordinate[];
  };
  MapFull: { location: Location.LocationObject | null };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator({
  isLoggedIn,
  onLoginSuccess,
  onLogout,
}: any) {
  if (!isLoggedIn) {
    return <AuthStack onLoginSuccess={onLoginSuccess} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainStack">
        {(props) => <MainStack {...props} onLogout={onLogout} />}
      </Stack.Screen>

      <Stack.Screen
        name="Running"
        component={RunningScreen}
        options={{ gestureEnabled: false }}
      />

      {/* ✅ 티어 전용 스크린 연결 */}
      <Stack.Screen
        name="TierRunning"
        component={TierRunningScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="GhostRun"
        component={GhostRunScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RunResult"
        component={RunResultScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="MapFull"
        component={MapFullScreen}
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="TierResult"
        component={TierResultScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
