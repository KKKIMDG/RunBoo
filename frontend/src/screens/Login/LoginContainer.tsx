import React from 'react';
import LoginScreen from './LoginScreen';
import { localLoginForm } from './LocalLoginForm';

export default function LoginContainer({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
    const {
        formState,
        formHandlers,
        apiHandlers,
        navigationHandlers,
    } = localLoginForm(onLoginSuccess);

    return (
        <LoginScreen
            email={formState.email}
            password={formState.password}
            onEmailChange={formHandlers.setEmail}
            onPasswordChange={formHandlers.setPassword}
            onLogin={apiHandlers.handleLogin}
            onSignUp={navigationHandlers.handleSignUp}
            onSocialLogin={navigationHandlers.handleSocialLogin}
            PasswordReset={navigationHandlers.handlePasswordReset}
        />
    );
}
