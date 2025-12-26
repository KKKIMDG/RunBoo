import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/Home/HomeScreen';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import SettingsScreen from '@/screens/Settings/SettingsScreen';
import CourseScreen from '@/screens/Course/CourseScreen';

const Stack = createNativeStackNavigator();

export default function AppStack({ onLogout }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Course" component={CourseScreen} />
        </Stack.Navigator>
    );
}
