// frontend/src/navigation/root/RootNavigator.tsx

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AuthStack from "../auth/AuthStack";
import MainStack from "@/navigation/stacks/MainStack";

import RunningScreen from "@/screens/running";
import RunResultScreen from "@/screens/RunResult";

// ✅ 고스트 런 스크린 추가 (경로는 네 프로젝트 구조에 맞게)
import GhostRunScreen from "@/screens/ghost/GhostRunScreen";

import { Coordinate } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";

export type RootStackParamList = {
    MainStack: undefined;

    // 일반 러닝
    Running: { targetDistance: number };

    // ✅ 고스트 러닝 (고스트 선택 화면에서 { ghost } 넘겨줘야 함)
    GhostRun: { ghost: GhostProfileDto };

    // 러닝 결과 (일반/고스트 공용 재사용)
    RunResult: {
        distanceM: number;
        durationSec: number;
        avgPaceSec: number;
        calories: number;
        routeCoordinates: Coordinate[];
    };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator({ isLoggedIn, onLoginSuccess, onLogout }: any) {
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
                name="GhostRun"
                component={GhostRunScreen}
                options={{ gestureEnabled: false }}
            />

            <Stack.Screen
                name="RunResult"
                component={RunResultScreen}
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}
