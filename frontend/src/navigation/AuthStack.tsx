import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screens/Login/LoginScreen';
import SignUpScreen from '@/screens/signup/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack({ onLoginSuccess }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {(props) => (
                    <LoginScreen
                        {...props}
                        onLoginSuccess={onLoginSuccess}
                    />
                )}
            </Stack.Screen>

            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
            />
        </Stack.Navigator>
    );
}
