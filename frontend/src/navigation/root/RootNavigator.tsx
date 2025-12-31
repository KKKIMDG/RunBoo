import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from 'expo-location'; // ✅ [추가 1] 타입 정의용 import

import AuthStack from "../auth/AuthStack";
import MainStack from "@/navigation/stacks/MainStack";

import RunningScreen from "@/screens/running";
import RunResultScreen from "@/screens/RunResult";
import GhostRunScreen from "@/screens/ghost/GhostRunScreen";
import MapFullScreen from "@/screens/Home/MapFullScreen"; // ✅ [추가 2] 파일 import
import TierResultScreen from "@/screens/TierResult/TierResultScreen";

import { Coordinate } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";

export type RootStackParamList = {
    MainStack: undefined;

    // 일반 러닝
    Running: {
        targetDistance: number;
        mode?: "NORMAL" | "TIER" | "GHOST"; // 추가된 부분
    };

    // 고스트 러닝
    GhostRun: { ghost: GhostProfileDto };

    // 러닝 결과
    RunResult: {
        distanceM: number;
        durationSec: number;
        avgPaceSec: number;
        calories: number;
        routeCoordinates: Coordinate[];
    };

    TierResult: {
        // 화면 표시용 (문자열)
        stats: {
            distance: string;
            time: string;
            pace: string;
        };
        // 로직용 (원본 데이터)
        achievedTier: string;
        distanceM: number;
        durationSec: number;
        avgPaceSec: number;
        calories: number;
        routeCoordinates: Coordinate[];
    };

    // ✅ [추가 3] 전체 화면 지도 (파라미터 타입 정의)
    MapFull: { location: Location.LocationObject | null };
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


            <Stack.Screen
                name="MapFull"
                component={MapFullScreen}
                options={{
                    headerShown: false,
                    presentation: 'card',
                }}
            />

            <Stack.Screen
                name="TierResult"
                component={TierResultScreen}
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}