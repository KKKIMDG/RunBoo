import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppStack({ onLogout }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}
