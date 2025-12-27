import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/Home/HomeScreen';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import SettingsScreen from '@/screens/Settings/SettingsScreen';
import CourseScreen from '@/screens/Course/CourseScreen';
import CourseDetailScreen from '@/screens/Course/CourseDetailScreen';
import RecordsScreen from '@/screens/records/RecordsScreen';
import StatsScreen from '@/screens/stats/StatsScreen';
import TierResultScreen from '@/screens/TierResult'; // 새로 최적화한 index.ts 경로

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
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
            <Stack.Screen name="Records" component={RecordsScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="TierResult" component={TierResultScreen} />
            
        </Stack.Navigator>
    );
}
