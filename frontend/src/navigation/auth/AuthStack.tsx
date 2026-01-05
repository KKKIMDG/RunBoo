import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginContainer from '@/screens/Login/LoginContainer';
import SignUpScreen from '@/screens/signup/SignupScreen';
import PasswordResetRequestScreen from "@/screens/passwordReset/PasswordResetRequestScreen";
import PasswordResetVerifyScreen from "@/screens/passwordReset/PasswordResetVerifyScreen";
import PasswordResetChangeScreen from "@/screens/passwordReset/PasswordResetChangeScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack({ onLoginSuccess }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {(props) => (
                    <LoginContainer
                        {...props}
                        onLoginSuccess={onLoginSuccess}
                    />
                )}
            </Stack.Screen>

            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
            />
            <Stack.Screen
                name="PasswordReset"
                component={PasswordResetRequestScreen}
            />
            <Stack.Screen
                name="PasswordResetVerify"
                component={PasswordResetVerifyScreen}
            />
            <Stack.Screen
                name="PasswordResetChange"
                component={PasswordResetChangeScreen}
            />
        </Stack.Navigator>
    );
}
