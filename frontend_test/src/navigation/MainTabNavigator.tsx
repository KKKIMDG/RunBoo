import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '@/screens/Home/HomeScreen';
import RecordScreen from '@/screens/records/RecordsScreen';
import CourseScreen from '@/screens/Course/CourseScreen';
import ProfileScreen from '@/screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Record" component={RecordScreen} />
            <Tab.Screen name="Course" component={CourseScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
