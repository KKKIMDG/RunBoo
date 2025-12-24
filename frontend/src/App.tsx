import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
    // 앱 상태 관리를 위한 state (로그인 상태, 유저 정보 등)
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userName, setUserName] = useState('');

    // 💡 Component1에서 로그인 성공 시 호출될 함수
    const handleAppLogin = (id: string, pw: string) => {
        // 실제 앱에서는 여기서 받은 ID/PW를 이용해
        // 서버에서 받은 토큰을 저장하고 메인 화면으로 이동합니다.

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // 로그인 성공 시 스타일
    loggedInContainer: {
        padding: 20,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statusText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    logoutButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ff4444',
        borderRadius: 5,
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
