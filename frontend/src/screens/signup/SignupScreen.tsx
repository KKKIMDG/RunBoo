import React from 'react';
import {View, Image, TouchableOpacity, Text, KeyboardAvoidingView, Platform} from 'react-native';
import { getStyles } from './Signup.styles';
import { useSignupForm } from './useSignupForm';
import { FormField, InlineFormField } from '@/components/form/FormField';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignUpScreen() {
    const { formState, formHandlers, apiHandlers } = useSignupForm();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);
    const {
        email,
        code,
        password,
        passwordCheck,
        nickname,
        isCodeSent,
        isEmailVerified,
        timeLeft,
        isCodeExpired,
        canResend,
    } = formState;
    const { setEmail, setCode, setPassword, setPasswordCheck, setNickname } = formHandlers;
    const { handleSendCode, handleVerifyCode, handleSignUp, formatTime } = apiHandlers;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View style={styles.container}>
            <Image
                style={styles.icon}
                source={require('@/assets/images/runboo.png')}
                resizeMode="contain"
            />

            <View style={styles.form}>
                <InlineFormField
                    label="이메일"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"

                    editable={!isCodeSent}
                    buttonText={
                        isCodeSent
                            ? `재발송`
                            : '인증'
                    }
                    onButtonPress={handleSendCode}
                    buttonDisabled={!canResend}
                    scheme={colorScheme}
                />
                {isCodeSent && (
                    <InlineFormField
                        label="인증코드"
                        value={code}
                        onChangeText={setCode}
                        placeholder="6자리 입력"
                        keyboardType="number-pad"
                        maxLength={6}
                        rightText={formatTime(timeLeft)}
                        editable={!isCodeExpired && !isEmailVerified}
                        buttonText={
                            isCodeExpired ? '만료' : '확인'
                        }
                        onButtonPress={handleVerifyCode}
                        buttonDisabled={isCodeExpired || isEmailVerified}
                        scheme={colorScheme}
                    />
                )}

                <FormField
                    label="비밀번호"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="비밀번호 입력"
                    secureTextEntry
                    scheme={colorScheme}
                />

                <FormField
                    label="비밀번호 확인"
                    value={passwordCheck}
                    onChangeText={setPasswordCheck}
                    placeholder="비밀번호 재입력"
                    secureTextEntry
                    scheme={colorScheme}
                />

                <FormField
                    label="닉네임"
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="사용할 닉네임"
                    scheme={colorScheme}
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSignUp}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>회원가입 완료</Text>
                </TouchableOpacity>
            </View>
        </View>
        </KeyboardAvoidingView>
    );
}