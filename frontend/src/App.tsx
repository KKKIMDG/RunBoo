import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");

    // 로그인 성공 시 호출
    const handleLogin = (id: string, pw: string) => {
        // TODO: 실제로는 여기서 API 호출 + 토큰 저장
        setIsLoggedIn(true);
        setUserName(id);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName("");
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});
