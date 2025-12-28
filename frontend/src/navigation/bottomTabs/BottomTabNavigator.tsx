import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

import HomeScreen from '@/screens/Home/HomeScreen';
import RecordScreen from '@/screens/records/RecordsScreen';
import CourseScreen from '@/screens/Course/CourseScreen';
import ChallengeScreen from '@/screens/Challange';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}

            // ⭐️ 핵심: 커스텀 바텀바 연결
            tabBar={({ state, navigation }) => {
                const routeName = state.routes[state.index].name;

                // route name ↔ UI 탭 이름 매핑
                const routeToTab = (route: string) => {
                    switch (route) {
                        case 'Home':
                            return '홈';
                        case 'Course':
                            return '코스';
                        case 'Record':
                            return '통계';
                        case 'Challenge':
                            return '도전';
                        default:
                            return '홈';
                    }
                };

                const tabToRoute = (tab: string) => {
                    switch (tab) {
                        case '홈':
                            return 'Home';
                        case '코스':
                            return 'Course';
                        case '통계':
                            return 'Record';
                        case '도전':
                            return 'Challenge';
                        default:
                            return 'Home';
                    }
                };

                return (
                    <BottomNavBar
                        activeTab={routeToTab(routeName)}
                        onTabPress={(tabName) => {
                            navigation.navigate(tabToRoute(tabName));
                        }}
                    />
                );
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Record" component={RecordScreen} />
            <Tab.Screen name="Course" component={CourseScreen} />
            <Tab.Screen name="Challenge" component={ChallengeScreen} />
        </Tab.Navigator>
    );
}
