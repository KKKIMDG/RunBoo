import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/Home/HomeScreen';
import LoginScreen from '@/screens/Login/LoginScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator({ isLoggedIn, onLogout, onLogin }: any) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} onLogout={onLogout} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={onLogin} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}