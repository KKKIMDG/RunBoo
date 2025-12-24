import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/Login";
import RecordsScreen from "../screens/records/RecordsScreen";
import StatsScreen from "../screens/stats/StatsScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator({
                                          isLoggedIn,
                                          onLogin,
                                          onLogout,
                                      }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                // 🔐 로그인 전: 무조건 LoginScreen
                <Stack.Screen name="Login">
                    {(props) => <LoginScreen {...props} onLogin={onLogin} />}
                </Stack.Screen>
            ) : (
                // ✅ 로그인 후: Records가 홈
                <>
                    <Stack.Screen name="Records" component={RecordsScreen} />
                    <Stack.Screen name="Stats" component={StatsScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}
