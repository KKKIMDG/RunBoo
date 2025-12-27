import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginContainer from '@/screens/Login/LoginContainer';
import SignUpScreen from '@/screens/signup/SignupScreen';

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
        </Stack.Navigator>
    );
}
