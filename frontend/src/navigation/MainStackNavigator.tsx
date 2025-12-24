import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseScreen from '../screens/Course/CourseScreen';
import CourseDetailScreen from '../screens/Course/CourseDetailScreen';

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* 로그인 후 가장 먼저 뜰 화면입니다.
        component={CourseScreen} 으로 바로 연결합니다.
      */}
            <Stack.Screen name="CourseMain" component={CourseScreen} />

            {/* 상세 페이지 (클릭 시 이동) */}
            <Stack.Screen
                name="CourseDetail"
                component={CourseDetailScreen}
                options={{
                    presentation: 'transparentModal', // 투명 팝업 모드
                    animation: 'fade',
                }}
            />
        </Stack.Navigator>
    );
}