import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "@/navigation/bottomTabs/BottomTabNavigator";

import SettingsScreen from "@/screens/Settings/SettingsScreen";
import CourseDetailScreen from "@/screens/Course/CourseDetailScreen";
import TierResultScreen from "@/screens/TierResult";
import ProfileScreen from "@/screens/Profile/ProfileScreen";
import BadgeCollectionModal from "@/screens/Badge/BadgeCollectionModal"; // dabin 추가분
import GhostRunScreen from "@/screens/ghost/GhostRunScreen";
import ChangePasswordScreen from "@/screens/Settings/ChangePasswordScreen";
import VerifyCurrentPasswordScreen from "@/screens/Settings/VerifyCurrentPasswordScreen";
import WithdrawScreen from "@/screens/Settings/WithdrawScreen";
import NotificationScreen from "@/screens/notification/NotificationScreen"; // dev 추가분

const Stack = createNativeStackNavigator();

export default function MainStack({ onLogout }: any) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 탭 전체 */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* 탭 위로 올라오는 화면들 */}

      {/* 1. 설정 화면 (로그아웃 함수 전달 위해 render callback 사용) */}
      <Stack.Screen name="Settings">
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
        <Stack.Screen name="VerifyCurrentPassword" component={VerifyCurrentPasswordScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen}/>
      {/* 프로필 */}
      <Stack.Screen name="Profile" component={ProfileScreen} />

        {/*알림*/}
        <Stack.Screen name="Notification" component={NotificationScreen} />

        {/*티어 결과*/}
      <Stack.Screen name="TierResult" component={TierResultScreen} />

      {/* 고스트 런 화면 (dev 브랜치 추가분) */}
      <Stack.Screen name="GhostRun" component={GhostRunScreen} />

      {/* 뱃지 컬렉션 (dabin 브랜치 추가분 - 투명 모달) */}
      <Stack.Screen
        name="BadgeCollection"
        component={BadgeCollectionModal}
        options={{
          presentation: "transparentModal",
          animation: "fade_from_bottom",
        }}
      />

      {/* 5. 코스 상세 (투명 모달 설정 공통) */}
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
