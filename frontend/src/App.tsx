import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = (id: string, pw: string) => {
        // 지금 방식 그대로: 아무 값이나 입력하면 로그인 성공
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <NavigationContainer>
            <RootNavigator
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                onLogout={handleLogout}
            />
        </NavigationContainer>
    );
}
