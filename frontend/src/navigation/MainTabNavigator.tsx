import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavBar } from '@/components//layout/BottomNavBar'; // 경로 확인해주세요

// ★ 연결할 화면들
import HomeScreen from '@/screens/Home/HomeScreen';
import CourseScreen from '@/screens/Course/CourseScreen'; // 코스 화면
import RecordScreen from '@/screens/records/RecordsScreen' //기록 화면
import StatsScreen from '@/screens/stats/StatsScreen'; // 통계 화면

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            // ★ 커스텀 탭바(BottomNavBar) 연결
            tabBar={(props) => {
                const currentRouteName = props.state.routes[props.state.index].name;
                return (
                    <BottomNavBar
                        activeTab={currentRouteName}
                        onTabPress={(tabName) => props.navigation.navigate(tabName)}
                    />
                );
            }}
            screenOptions={{ headerShown: false }}
        >
            {/* 주의: name은 BottomNavBar에 적은 이름('홈', '코스'..)과 똑같아야 합니다.
      */}
            <Tab.Screen name="홈" component={HomeScreen} />
            <Tab.Screen name="코스" component={CourseScreen} />

            {/* 아직 안 만든 화면은 임시로 HomeScreen 연결 */}
            <Tab.Screen name="도전" component={HomeScreen} />
            <Tab.Screen name="통계" component={RecordScreen} />
        </Tab.Navigator>
    );
}