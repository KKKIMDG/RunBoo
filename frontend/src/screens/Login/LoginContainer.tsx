import React from 'react';
import LoginScreen from './LoginScreen';
import { useLoginForm } from './useLoginForm';

export default function LoginContainer({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
    const {
        formState,
        formHandlers,
        apiHandlers,
        navigationHandlers,
    } = useLoginForm(onLoginSuccess);

    return (
        <LoginScreen
            email={formState.email}
            password={formState.password}
            onEmailChange={formHandlers.setEmail}
            onPasswordChange={formHandlers.setPassword}
            onLogin={apiHandlers.handleLogin}
            onSignUp={navigationHandlers.handleSignUp}
            onSocialLogin={navigationHandlers.handleSocialLogin}
        />
    );
}
