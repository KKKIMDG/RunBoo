import React from 'react';
import { createStackNavigator } from '@react-navigation/stack'; // 1. 스택 네비게이터 임포트
import AuthStack from '../auth/AuthStack';
import MainStack from '@/navigation/stacks/MainStack';
import RunningScreen from '@/screens/running';
import RunResultScreen from '@/screens/RunResult';
import { Coordinate } from '@/utils/runUtils'

// 3. 네비게이션 타입 정의 (이게 있어야 빨간 줄이 사라집니다)
export type RootStackParamList = {
    MainStack: undefined;
    Running: { targetDistance: number };
    // ▼▼▼ 결과 화면 및 파라미터 타입 정의 ▼▼▼
    RunResult: {
        distanceM: number;
        durationSec: number;
        avgPaceSec: number;
        calories: number;
        routeCoordinates: Coordinate[];
    };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator({
                                          isLoggedIn,
                                          onLoginSuccess,
                                          onLogout,
                                      }: any) {
    // 1) 로그인 안 했을 때 -> 로그인 화면(AuthStack) 보여줌
    if (!isLoggedIn) {
        return <AuthStack onLoginSuccess={onLoginSuccess} />;
    }

    // 2) 로그인 했을 때 -> MainStack과 Running을 포함하는 '새로운 스택'을 반환
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

            {/* 3. 스택에 화면 등록 */}
            <Stack.Screen
                name="RunResult"
                component={RunResultScreen}
                // 결과 화면에서도 뒤로가기 제스처 막는 게 좋음 (홈 버튼으로만 이동)
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}