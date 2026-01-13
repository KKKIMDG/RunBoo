// frontend/src/navigation/root/RootNavigator.tsx

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";

import AuthStack from "../auth/AuthStack";
import MainStack from "@/navigation/stacks/MainStack";

// 홈 화면에서 실행되는 화면들 import
import RunningScreen from "@/screens/running";
import TierRunningScreen from "@/screens/running/TierRunningScreen";
import RunResultScreen from "@/screens/RunResult";
import GhostRunScreen from "@/screens/ghost/GhostRunScreen";
import MapFullScreen from "@/screens/Home/MapFullScreen";
import TierResultScreen from "@/screens/TierResult/TierResultScreen";
import RunRecordDetailScreen from "@/screens/records/RunRecordDetailScreen";

import { Coordinate } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";

export type RootStackParamList = {
  MainStack: undefined;

  Running: {
    userId: number;
    targetDistance: number;
    mode?: "NORMAL";
    voiceGuideEnabled: boolean;
    voiceType: "MALE" | "FEMALE";
  };

  TierRunning: {
    userId?: number;
    targetDistance: number;
    mode?: "TIER";
    distanceType?: "5km" | "10km";
  };

  GhostRun: {
    ghost: GhostProfileDto;
    userId?: number;
    isMale?: boolean;
  };

  RunResult: {
    distanceM: number;
    durationSec: number;
    avgPaceSec: number;
    calories: number;
    routeCoordinates: Coordinate[];
    cadenceSpm?: number; // dabin 브랜치 기능 유지
    recordId?: number; // dev 브랜치 기능 유지
  };

  TierResult: {
    userId?: number;
    recordId: number;
    distanceType: "5k" | "10k";
    achievedTier: string;
    isStopped?: boolean;
    cadenceSpm?: number;

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

  RunRecordDetail: { recordId: number };
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

      <Stack.Screen
        name="RunRecordDetail"
        component={RunRecordDetailScreen}
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack.Navigator>
  );
}
