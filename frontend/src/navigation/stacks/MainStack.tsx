import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "@/navigation/bottomTabs/BottomTabNavigator";

import SettingsScreen from "@/screens/Settings/SettingsScreen";
import CourseDetailScreen from "@/screens/Course/CourseDetailScreen";
import TierResultScreen from "@/screens/TierResult";
import ProfileScreen from "@/screens/Profile/ProfileScreen";
import React from "react";
import BadgeCollectionModal from "@/screens/Badge/BadgeCollectionModal";

const Stack = createNativeStackNavigator();

export default function MainStack({ onLogout }: any) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 탭 전체 */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* 탭 위로 올라오는 화면들 */}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="BadgeCollection"
        component={BadgeCollectionModal}
        options={{
          presentation: "transparentModal", // 반투명 모달 설정
          animation: "fade_from_bottom",
        }}
      />
      <Stack.Screen name="TierResult" component={TierResultScreen} />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{
          presentation: "transparentModal",
          contentStyle: {
            backgroundColor: "rgba(0,0,0,0.4)",
          },
        }}
      />
    </Stack.Navigator>
  );
}
