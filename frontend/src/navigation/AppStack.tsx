import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ★ 방금 만든 탭 네비게이터 불러오기
import MainTabNavigator from './MainTabNavigator';

// 상세 페이지들 (탭바 없이 덮어씌워질 화면들)
import CourseDetailScreen from '@/screens/Course/CourseDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppStack({ onLogout }: any) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* ★ 1. 스택의 첫 번째 화면을 '탭 네비게이터'로 설정합니다.
        이렇게 하면 로그인 후 바로 하단바가 있는 화면이 뜹니다.
      */}
            <Stack.Screen name="MainTab" component={MainTabNavigator} />

            {/* ★ 2. 상세 페이지들은 탭 네비게이터 '밖에' 둡니다.
        그래야 상세 페이지 들어갔을 때 하단바가 가려지고 전체 화면을 씁니다.
      */}
            <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />

        </Stack.Navigator>
    );
}