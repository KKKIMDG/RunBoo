
import { useState } from 'react';
import { Alert } from 'react-native';
import { AuthService } from '@/services/auth/authService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// AuthStack의 네비게이션 파라미터 타입을 정의합니다.
// 실제 프로젝트의 네비게이션 스택에 맞게 수정해야 합니다.
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

export const useSignupForm = () => {
    const navigation = useNavigation<NavigationProp>();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [nickname, setNickname] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

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
            await AuthService.sendEmailCode(email);
            Alert.alert('성공', '인증 코드가 전송되었습니다. 메일함을 확인해주세요.');
            setIsCodeSent(true);
        } catch (error: any) {
            console.error('인증 메일 발송 에러:', error);
            Alert.alert('실패', error?.response?.data?.message || '인증 코드 전송에 실패했습니다.');
        }
    };

    const handleVerifyCode = async () => {
        if (code.length !== 6) {
            Alert.alert('오류', '인증 코드는 6자리입니다');
            return;
        }
        try {
            await AuthService.verifyEmailCode(email, code);
            Alert.alert('완료', '이메일 인증이 완료되었습니다.');
            setIsEmailVerified(true);
        } catch (error: any) {
            Alert.alert('실패', error?.response?.data?.message || '인증 코드가 올바르지 않습니다.');
        }
    };

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
                { text: '확인', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error: any) {
            Alert.alert('회원가입 실패', error?.response?.data?.message || '다시 시도해주세요.');
        }
    };

    return {
        formState: {
            email,
            code,
            password,
            passwordCheck,
            nickname,
            isCodeSent,
            isEmailVerified,
        },
        formHandlers: {
            setEmail,
            setCode,
            setPassword,
            setPasswordCheck,
            setNickname,
        },
        apiHandlers: {
            handleSendCode,
            handleVerifyCode,
            handleSignUp,
        },
    };
};
