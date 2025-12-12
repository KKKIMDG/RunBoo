// mobile-app/App.tsx

import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity } from 'react-native';
import Component1 from './components/Component1'; // 👈 Component1을 불러옵니다.

export default function App() {
    // 앱 상태 관리를 위한 state (로그인 상태, 유저 정보 등)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');

    // 💡 Component1에서 로그인 성공 시 호출될 함수
    const handleAppLogin = (id: string, pw: string) => {
        // 실제 앱에서는 여기서 받은 ID/PW를 이용해
        // 서버에서 받은 토큰을 저장하고 메인 화면으로 이동합니다.

        // 현재는 로그인 상태만 변경
        setIsLoggedIn(true);
        setUserName(id);

        Alert.alert('로그인 성공', `환영합니다, ${id}님!`);
    };

    // 💡 Component1에서 회원가입 버튼 클릭 시 호출될 함수
    const handleAppSignUp = () => {
        Alert.alert('회원가입 이동', '회원가입 화면으로 이동합니다.');
        // 실제로는 navigation.navigate('SignUpScreen'); 등을 사용합니다.
    };

    // 💡 로그아웃 함수 (테스트용)
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName('');
        Alert.alert('로그아웃', '로그아웃 되었습니다.');
    };

    return (
        <View style={styles.container}>
            {/* 로그인 여부에 따라 화면을 다르게 보여줍니다.
      */}
            {isLoggedIn ? (
                // --- 로그인 성공 시 보이는 화면 ---
                <View style={styles.loggedInContainer}>
                    <Text style={styles.welcomeText}>🎉 {userName}님, 환영합니다! 🎉</Text>
                    <Text style={styles.statusText}>이제 메인 화면을 구성하면 됩니다.</Text>
                    <Text style={styles.statusText}>백엔드 API(`http://localhost:8080/api/running`) 연동 준비 완료!</Text>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>로그아웃</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // --- 로그인 전 (Component1 화면) ---
                <Component1
                    onLogin={handleAppLogin} // 로그인 버튼 클릭 시 실행될 함수 연결
                    onSignUp={handleAppSignUp} // 회원가입 버튼 클릭 시 실행될 함수 연결
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
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