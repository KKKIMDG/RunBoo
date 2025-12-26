import React, { FC } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getStyles } from './Login.styles';
// Signup 스크린에서 만들었던 재사용 컴포넌트를 임포트합니다.
import { FormField } from '@/components/form/FormField';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoginScreenProps {
    email?: string;
    password?: string;
    onEmailChange?: (text: string) => void;
    onPasswordChange?: (text: string) => void;
    onLogin?: () => void;
    onSignUp?: () => void;
    onSocialLogin?: (platform: 'Google' | 'Kakao') => void;
}

const LoginScreen: FC<LoginScreenProps> = ({
    email,
    password,
    onEmailChange,
    onPasswordChange,
    onLogin,
    onSignUp,
    onSocialLogin,
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);

    return (
        <View style={styles.container}>
            <Image
                style={styles.icon}
                source={require('@/assets/images/runboo.png')}
                resizeMode="contain"
            />

            <View style={styles.form}>
                <FormField
                    label="아이디"
                    value={email}
                    onChangeText={onEmailChange}
                    placeholder="아이디를 입력하세요"
                    autoCapitalize="none"
                    scheme={colorScheme}
                />

                <FormField
                    label="비밀번호"
                    value={password}
                    onChangeText={onPasswordChange}
                    placeholder="비밀번호를 입력하세요"
                    secureTextEntry
                    scheme={colorScheme}
                />

                <TouchableOpacity onPress={onLogin} activeOpacity={0.8}>
                    <View style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>로그인</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <View style={styles.orTextWrapper}>
                    <Text style={styles.orText}>or</Text>
                </View>
                <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialLoginContainer}>
                <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => onSocialLogin?.('Google')}
                >
                    <Image
                        style={styles.socialIcon}
                        source={require('@/assets/images/google.png')}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.kakaoButton]}
                    onPress={() => onSocialLogin?.('Kakao')}
                >
                    <Image
                        style={styles.socialIcon}
                        source={require('@/assets/images/kakao.png')}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>계정이 없으신가요?</Text>
                <TouchableOpacity onPress={onSignUp} style={styles.signupButton}>
                    <Text style={styles.signupButtonText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default LoginScreen;
