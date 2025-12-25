import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { setAccessToken } from '@/services/api';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = (token: string) => {
        setAccessToken(token);
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        setAccessToken(null);
        setIsLoggedIn(false);
    };

    return (
        <NavigationContainer>
            {/*<RootNavigator*/}
            {/*    isLoggedIn={isLoggedIn}*/}
            {/*    onLogin={handleLoginSuccess}*/}
            {/*    onLogout={handleLogout}*/}
            {/*/>*/}
            <RootNavigator
                isLoggedIn={isLoggedIn}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
            />
        </NavigationContainer>
    );
}
