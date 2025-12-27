import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import CourseScreen from '@/screens/Course/CourseScreen';
import CourseDetailScreen from '@/screens/Course/CourseDetailScreen';

export type RootStackParamList = {
    Records: undefined;
};

const Stack = createStackNavigator();

export default function MainStackNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Course" component={CourseScreen} />
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        </Stack.Navigator>
    );
}