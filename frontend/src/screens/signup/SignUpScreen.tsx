import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert, KeyboardAvoidingView, Platform,
    ScrollView,
} from 'react-native';
// 새로 만든 회원가입 전용 스타일 임포트
import { signupStyles as styles } from '../styles/Signup.styles';
import { AuthService } from '@/services/auth/authService';

export default function SignUpScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [nickname, setNickname] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    /* ===================== 이메일 형식 검사 ===================== */
    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    /* ===================== 이메일 인증 코드 전송 (API 연결) ===================== */
    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('오류', '이메일을 입력하세요');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('오류', '이메일 형식이 올바르지 않습니다');
            return;
        }

        try {
            // AuthService를 통해 서버로 인증 메일 발송 요청
            await AuthService.sendEmailCode(email);

            Alert.alert('성공', '인증 코드가 전송되었습니다. 메일함을 확인해주세요.');
            setIsCodeSent(true);
        } catch (error: any) {
            console.error('인증 메일 발송 에러:', error);
            Alert.alert(
                '실패',
                error?.response?.data?.message || '인증 코드 전송에 실패했습니다.'
            );
        }
    };

    /* ===================== 인증 코드 확인 (API 연결) ===================== */
    const handleVerifyCode = async () => {
        if (code.length !== 6) {
            Alert.alert('오류', '인증 코드는 6자리입니다');
            return;
        }

        try {
            // 입력한 코드 검증 API 호출
            await AuthService.verifyEmailCode(email, code);
            Alert.alert('완료', '이메일 인증이 완료되었습니다.');
            setIsEmailVerified(true);
        } catch (error: any) {
            Alert.alert(
                '실패',
                error?.response?.data?.message || '인증 코드가 올바르지 않습니다.'
            );
        }
    };

    /* ===================== 최종 회원가입 (API 연결) ===================== */
    const handleSignUp = async () => {
        if (!isEmailVerified) {
            Alert.alert('오류', '이메일 인증을 먼저 완료해주세요.');
            return;
        }
        if (!password || password !== passwordCheck) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!nickname) {
            Alert.alert('오류', '닉네임을 입력하세요.');
            return;
        }

        try {
            await AuthService.signup({ email, password, nickname });
            Alert.alert('축하합니다!', '회원가입이 완료되었습니다.', [
                {
                    text: '확인',
                    onPress: () => {
                        navigation.navigate('Login');
                    },
                }
            ]);
        } catch (error: any) {
            Alert.alert('회원가입 실패', error?.response?.data?.message || '다시 시도해주세요.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.container}
        >
            <Image
                style={styles.icon}
                source={require('../../components/img/runboo.png')}
                resizeMode="contain"
            />

            <View style={styles.form}>
                {/* 이메일 입력 섹션 */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>이메일</Text>
                    <View style={styles.inlineInputBox}>
                        <TextInput
                            style={styles.textInput}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="example@email.com"
                            placeholderTextColor="#aaa"
                            editable={!isEmailVerified}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TouchableOpacity
                            style={styles.inlineButton}
                            onPress={handleSendCode}
                            disabled={isEmailVerified}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.inlineButtonText}>인증</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 인증코드 입력 섹션 (메일 발송 후에만 표시) */}
                {isCodeSent && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>인증코드</Text>
                        <View style={styles.inlineInputBox}>
                            <TextInput
                                style={styles.textInput}
                                value={code}
                                onChangeText={setCode}
                                placeholder="6자리 입력"
                                placeholderTextColor="#aaa"
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!isEmailVerified}
                            />
                            <TouchableOpacity
                                style={styles.inlineButton}
                                onPress={handleVerifyCode}
                                disabled={isEmailVerified}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.inlineButtonText}>확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>비밀번호</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInputBox}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="비밀번호 입력"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>비밀번호 확인</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInputBox}
                            secureTextEntry
                            value={passwordCheck}
                            onChangeText={setPasswordCheck}
                            placeholder="비밀번호 재입력"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>닉네임</Text>
                    <View style={styles.inputBox}>
                        <TextInput
                            style={styles.textInputBox}
                            value={nickname}
                            onChangeText={setNickname}
                            placeholder="사용할 닉네임"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSignUp}
                    activeOpacity={0.8}
                >
                    <Text style={styles.submitButtonText}>회원가입 완료</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}